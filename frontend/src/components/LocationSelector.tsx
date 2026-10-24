import { useState, useEffect } from 'react';
import { MapPin, Loader2, Navigation, CheckCircle2 } from 'lucide-react';
import type { TranslationDictionary } from '../i18n/translations';

interface LocationProps {
  onLocationFound: (lat: number, lng: number, address: string) => void;
  currentLocation?: { lat: number; lng: number; address: string } | null;
  t: TranslationDictionary;
}

export default function LocationSelector({ onLocationFound, currentLocation, t }: LocationProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [displayAddress, setDisplayAddress] = useState(currentLocation?.address || '');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    currentLocation ? { lat: currentLocation.lat, lng: currentLocation.lng } : null
  );

  useEffect(() => {
    if (currentLocation) {
      setDisplayAddress(currentLocation.address);
      setCoords({ lat: currentLocation.lat, lng: currentLocation.lng });
    }
  }, [currentLocation]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError(t.complaintForm.geoNotSupported);
      return;
    }

    setLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });

        let resolvedAddress = `GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                'User-Agent': 'SmartCityPlatform/1.0'
              }
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data && data.display_name) {
              resolvedAddress = data.display_name;
            }
          }
        } catch (err) {
          console.warn("Reverse geocode request failed, using GPS coordinates directly:", err);
          // Coordinates are strictly preserved even if reverse geocoding network fails
        } finally {
          setDisplayAddress(resolvedAddress);
          onLocationFound(latitude, longitude, resolvedAddress);
          setLoading(false);
        }
      },
      (err) => {
        setLoading(false);
        switch (err.code) {
          case 1: // PERMISSION_DENIED
            setError(t.complaintForm.locationDenied);
            break;
          case 2: // POSITION_UNAVAILABLE
            setError(t.complaintForm.locationUnavailable);
            break;
          case 3: // TIMEOUT
            setError(t.complaintForm.locationTimeout);
            break;
          default:
            setError(t.complaintForm.locationGenericError);
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  return (
    <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 w-full transition-colors duration-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-cyan-600 dark:text-neonCyan" />
          {t.complaintForm.locationSectionTitle}
        </h3>
        {coords && (
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t.complaintForm.gpsLocked}
          </span>
        )}
      </div>
      
      <button
        type="button"
        onClick={handleGetLocation}
        disabled={loading}
        className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-700 dark:bg-neonCyan dark:hover:bg-cyan-400 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white dark:text-slate-950 disabled:text-slate-500 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {t.complaintForm.fetchingLocation}
          </>
        ) : (
          <>
            <MapPin className="w-5 h-5" />
            {t.complaintForm.useLocationBtn}
          </>
        )}
      </button>

      {coords && (
        <div className="mt-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-300 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
            <span className="font-semibold text-slate-500 dark:text-slate-400">{t.complaintForm.coordinatesLabel}</span>
            <span className="font-mono text-cyan-600 dark:text-neonCyan font-bold">
              {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
            </span>
          </div>
          {displayAddress && (
            <p className="pt-0.5">
              <span className="font-bold text-slate-700 dark:text-slate-200">{t.complaintForm.detectedLocationLabel} </span>
              <span className="text-slate-600 dark:text-slate-400">{displayAddress}</span>
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="mt-3 text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
          <span>⚠️</span> {error}
        </p>
      )}
    </div>
  );
}