import { useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

interface LocationProps {
  onLocationFound: (lat: number, lng: number, address: string) => void;
}

export default function LocationSelector({ onLocationFound }: LocationProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [displayAddress, setDisplayAddress] = useState('');

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                'User-Agent': 'SmartCityPlatform/1.0'
              }
            }
          );
          
          const data = await response.json();
          const resolvedAddress = data.display_name || 'Address details found';
          
          setDisplayAddress(resolvedAddress);
          onLocationFound(latitude, longitude, resolvedAddress);
          
        } catch (err) {
          setError('Could not convert coordinates to a physical address.');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError(`Location access denied: ${err.message}`);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  return (
    <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 w-full max-w-md transition-colors duration-200">
      <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Report Location</h3>
      
      <button
        type="button"
        onClick={handleGetLocation}
        disabled={loading}
        className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-700 dark:bg-neonCyan dark:hover:bg-cyan-400 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white dark:text-slate-950 disabled:text-slate-500 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Fetching location...
          </>
        ) : (
          <>
            <MapPin className="w-5 h-5" />
            Use My Current Location
          </>
        )}
      </button>

      {displayAddress && (
        <div className="mt-4 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-300">
          <p><span className="font-bold text-cyan-600 dark:text-neonCyan">Detected Location:</span> {displayAddress}</p>
        </div>
      )}

      {error && <p className="mt-3 text-xs text-red-600 dark:text-red-400 font-medium">⚠️ {error}</p>}
    </div>
  );
}