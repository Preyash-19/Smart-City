import { useEffect, useRef, useMemo, useState } from 'react';
import { MapPin, Layers, Info } from 'lucide-react';

interface Complaint {
  id: string;
  title: string;
  description: string;
  department: string;
  priority: string;
  status: string;
  latitude: number;
  longitude: number;
  address: string;
  createdAt: string;
}

interface ComplaintHeatmapProps {
  complaints: Complaint[];
}

// Department color map
const DEPT_COLORS: Record<string, string> = {
  ROAD: '#06b6d4',
  SANITATION: '#f59e0b',
  WATER_SUPPLY: '#3b82f6',
  ELECTRICAL: '#eab308',
  DRAINAGE: '#8b5cf6',
  TRAFFIC: '#ef4444',
  GENERAL: '#6b7280',
};

const DEPT_LABELS: Record<string, string> = {
  ALL: 'All Departments',
  ROAD: 'Roads & Streets',
  SANITATION: 'Waste & Sanitation',
  WATER_SUPPLY: 'Water Supply',
  ELECTRICAL: 'Power & Lighting',
  DRAINAGE: 'Drainage',
  TRAFFIC: 'Traffic & Signals',
};

export default function ComplaintHeatmap({ complaints }: ComplaintHeatmapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const heatLayerRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [deptFilter, setDeptFilter] = useState('ALL');
  const [mapError, setMapError] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [heatEnabled, setHeatEnabled] = useState(true);
  const [popupInfo, setPopupInfo] = useState<{ total: number; byDept: Record<string, number>; address: string } | null>(null);

  // Valid complaints (both lat and lng must exist and be non-zero meaningful values)
  const validComplaints = useMemo(() => {
    return complaints.filter(c =>
      c.latitude != null &&
      c.longitude != null &&
      !isNaN(c.latitude) &&
      !isNaN(c.longitude) &&
      c.latitude !== 0 &&
      c.longitude !== 0
    );
  }, [complaints]);

  // Filtered by department
  const filteredComplaints = useMemo(() => {
    if (deptFilter === 'ALL') return validComplaints;
    return validComplaints.filter(c => c.department === deptFilter);
  }, [validComplaints, deptFilter]);

  // Stats for info panel
  const stats = useMemo(() => {
    const byDept: Record<string, number> = {};
    filteredComplaints.forEach(c => {
      byDept[c.department] = (byDept[c.department] || 0) + 1;
    });
    return { total: filteredComplaints.length, byDept };
  }, [filteredComplaints]);

  // Compute center of the map from all valid complaints, fallback to India center
  const mapCenter = useMemo<[number, number]>(() => {
    if (validComplaints.length === 0) return [20.5937, 78.9629];
    const avgLat = validComplaints.reduce((sum, c) => sum + c.latitude, 0) / validComplaints.length;
    const avgLng = validComplaints.reduce((sum, c) => sum + c.longitude, 0) / validComplaints.length;
    return [avgLat, avgLng];
  }, [validComplaints]);

  // Initialize Leaflet map once.
  // React Strict Mode fires this effect twice: mount → cleanup → mount.
  // We handle this with two strategies:
  //   1. A `cancelled` flag so async initMap bails out if cleanup already fired.
  //   2. Synchronous container reset BEFORE calling initMap so any orphaned
  //      Leaflet map from the previous run is destroyed before L.map() is called.
  useEffect(() => {
    if (!mapRef.current) return;
    const container = mapRef.current;
    let cancelled = false;

    // ── Synchronously destroy any orphaned Leaflet map on this container ──
    // This must run BEFORE initMap (async) because cleanup (from a prior mount)
    // may not have fully cleaned up before the second effect fires.
    if ((container as any)._leaflet_id) {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
        } catch (_) { /* ignore */ }
        mapInstanceRef.current = null;
        heatLayerRef.current = null;
      }
      (container as any)._leaflet_id = null;
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    }

    const initMap = async () => {
      try {
        const L = (await import('leaflet')).default;
        if (cancelled) return; // cleanup fired during async import — bail out

        await import('leaflet/dist/leaflet.css');
        if (cancelled) return;

        // Expose L globally so UMD plugins can attach to it
        (window as any).L = L;

        // Fix default icon paths broken by Vite bundler
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        // Load leaflet.heat from the npm package (already installed)
        let heatAvailable = false;
        try {
          await import('leaflet.heat');
          if (cancelled) return;
          // leaflet.heat attaches heatLayer to window.L / L
          if (typeof (L as any).heatLayer === 'function') {
            heatAvailable = true;
          }
        } catch (heatErr) {
          console.warn('leaflet.heat not available, using circle markers only:', heatErr);
        }
        if (cancelled) return;
        if (!heatAvailable) setHeatEnabled(false);

        const map = L.map(container, {
          center: mapCenter,
          zoom: 12,
          zoomControl: true,
          scrollWheelZoom: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        if (cancelled) {
          map.remove();
          return;
        }

        mapInstanceRef.current = map;
        setMapReady(true);
      } catch (err) {
        if (!cancelled) {
          console.error('Map initialization failed:', err);
          setMapError(true);
        }
      }
    };

    initMap();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove(); } catch (_) { /* ignore */ }
        mapInstanceRef.current = null;
        heatLayerRef.current = null;
        setMapReady(false);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update heatmap and markers whenever filtered complaints or heatEnabled change
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    const updateMap = () => {
      try {
        const L = (window as any).L;
        if (!L) return;

        // Clear existing markers
        markersRef.current.forEach(m => { try { m.remove(); } catch (_) { /**/ } });
        markersRef.current = [];

        // Remove old heat layer
        if (heatLayerRef.current) {
          try { mapInstanceRef.current.removeLayer(heatLayerRef.current); } catch (_) { /**/ }
          heatLayerRef.current = null;
        }

        if (filteredComplaints.length === 0) return;

        // --- HEATMAP LAYER ---
        if (heatEnabled && typeof L.heatLayer === 'function') {
          const heatPoints = filteredComplaints.map(c => [
            c.latitude, c.longitude, 1.0,
          ] as [number, number, number]);

          const heatLayer = L.heatLayer(heatPoints, {
            radius: 35,
            blur: 25,
            maxZoom: 17,
            max: 1.0,
            minOpacity: 0.4,
            gradient: {
              0.0: '#3b82f6',
              0.3: '#06b6d4',
              0.5: '#22c55e',
              0.7: '#f59e0b',
              0.9: '#ef4444',
              1.0: '#dc2626',
            },
          });
          heatLayer.addTo(mapInstanceRef.current);
          heatLayerRef.current = heatLayer;
        }

        // --- CLUSTER CIRCLE MARKERS (always shown for click interactivity) ---
        const gridSize = 0.0005; // ~50m cells
        const cells: Record<string, { complaints: Complaint[]; lat: number; lng: number }> = {};

        filteredComplaints.forEach(c => {
          const cellKey = `${Math.round(c.latitude / gridSize)}_${Math.round(c.longitude / gridSize)}`;
          if (!cells[cellKey]) {
            cells[cellKey] = { complaints: [], lat: c.latitude, lng: c.longitude };
          }
          cells[cellKey].complaints.push(c);
        });

        Object.values(cells).forEach(cell => {
          const count = cell.complaints.length;
          const radius = Math.min(6 + count * 2, 20);

          const deptCounts: Record<string, number> = {};
          cell.complaints.forEach(c => {
            deptCounts[c.department] = (deptCounts[c.department] || 0) + 1;
          });
          const topDept = Object.entries(deptCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'GENERAL';
          const color = DEPT_COLORS[topDept] || '#6b7280';

          const byDeptFormatted: Record<string, number> = {};
          cell.complaints.forEach(c => {
            byDeptFormatted[c.department] = (byDeptFormatted[c.department] || 0) + 1;
          });

          const circle = L.circleMarker([cell.lat, cell.lng], {
            radius,
            fillColor: color,
            color: 'white',
            weight: 1.5,
            opacity: 0.9,
            fillOpacity: heatEnabled ? 0.5 : 0.75,
          });

          const address = cell.complaints[0]?.address || 'Unknown Location';
          circle.on('click', () => {
            setPopupInfo({ total: count, byDept: byDeptFormatted, address });
          });

          circle.addTo(mapInstanceRef.current);
          markersRef.current.push(circle);
        });

        // Fit map to complaint bounds
        const latlngs = filteredComplaints.map(c => [c.latitude, c.longitude] as [number, number]);
        const bounds = L.latLngBounds(latlngs);
        mapInstanceRef.current.fitBounds(bounds.pad(0.15), { maxZoom: 15 });
      } catch (err) {
        console.error('Map update failed:', err);
      }
    };

    updateMap();
  }, [mapReady, filteredComplaints, heatEnabled]);

  const departments = ['ALL', 'ROAD', 'SANITATION', 'WATER_SUPPLY', 'ELECTRICAL', 'DRAINAGE', 'TRAFFIC'];

  if (mapError) {
    return (
      <div className="w-full p-8 text-center bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-2xl">
        <MapPin className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Unable to load complaint map.</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">The rest of the dashboard continues to work normally.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-100 dark:bg-purple-500/10 border border-purple-300 dark:border-purple-500/30 rounded-lg">
            <MapPin className="w-4 h-4 text-purple-700 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wide flex items-center gap-2">
              Complaint Heatmap
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {stats.total} complaint{stats.total !== 1 ? 's' : ''} plotted
              {deptFilter !== 'ALL' ? ` for ${DEPT_LABELS[deptFilter] || deptFilter}` : ' city-wide'}
            </p>
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Heat toggle switch */}
          <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs font-semibold text-slate-600 dark:text-slate-300">
            <div
              role="switch"
              aria-checked={heatEnabled}
              onClick={() => setHeatEnabled(v => !v)}
              className={`relative w-8 h-4 rounded-full transition-colors duration-200 ${
                heatEnabled ? 'bg-purple-500' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform duration-200 ${
                heatEnabled ? 'translate-x-4' : ''
              }`} />
            </div>
            Heatmap
          </label>

          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="bg-white dark:bg-slate-950 border border-purple-200 dark:border-purple-500/40 text-purple-800 dark:text-purple-300 text-xs font-bold rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 transition-all"
            >
              {departments.map(d => (
                <option key={d} value={d}>{DEPT_LABELS[d] || d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Click popup info card */}
      {popupInfo && (
        <div className="mb-4 p-4 bg-white dark:bg-slate-900/80 border border-purple-200 dark:border-purple-500/30 rounded-xl shadow-lg flex flex-col sm:flex-row justify-between items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-bold text-slate-800 dark:text-white">Complaint Cluster</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 truncate">{popupInfo.address}</p>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold mb-2">
              Total reports in this area: <span className="text-purple-700 dark:text-purple-400">{popupInfo.total}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(popupInfo.byDept).map(([dept, count]) => (
                <span
                  key={dept}
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full border"
                  style={{
                    color: DEPT_COLORS[dept] || '#6b7280',
                    borderColor: (DEPT_COLORS[dept] || '#6b7280') + '50',
                    backgroundColor: (DEPT_COLORS[dept] || '#6b7280') + '15',
                  }}
                >
                  {dept}: {count}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={() => setPopupInfo(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold px-2 py-1 rounded"
          >
            ✕ Close
          </button>
        </div>
      )}

      {/* Map Container */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md">
        {/* Loading overlay */}
        {!mapReady && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-2xl">
            <MapPin className="w-8 h-8 text-purple-500 animate-bounce mb-2" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Loading complaint map...</p>
          </div>
        )}

        {/* Empty state overlay */}
        {mapReady && filteredComplaints.length === 0 && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50/90 dark:bg-slate-900/90 rounded-2xl">
            <MapPin className="w-8 h-8 text-slate-400 mb-2" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No location data available</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">for the selected filter</p>
          </div>
        )}

        {/* Leaflet map mount point */}
        <div ref={mapRef} className="w-full h-[420px] sm:h-[500px]" style={{ zIndex: 0 }} />

        {/* Legend */}
        {mapReady && filteredComplaints.length > 0 && (
          <div className="absolute bottom-4 left-4 z-[400] bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-lg backdrop-blur-sm">
            {heatEnabled ? (
              <>
                <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">Heat Intensity</p>
                <div className="flex items-center gap-1 h-2.5 w-28 rounded-full overflow-hidden">
                  <div className="flex-1 h-full" style={{ background: 'linear-gradient(to right, #3b82f6, #06b6d4, #22c55e, #f59e0b, #ef4444, #dc2626)' }} />
                </div>
                <div className="flex justify-between text-[9px] text-slate-500 dark:text-slate-400 mt-0.5 w-28">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </>
            ) : (
              <>
                <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">Departments</p>
                <div className="flex flex-col gap-1">
                  {Object.entries(DEPT_COLORS).map(([dept, color]) => (
                    <div key={dept} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-[9px] text-slate-500 dark:text-slate-400">{DEPT_LABELS[dept] || dept}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
