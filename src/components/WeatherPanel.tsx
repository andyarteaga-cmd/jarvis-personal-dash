import { useEffect, useState } from 'react';
import {
  Sun, Cloud, CloudSun, CloudRain, CloudSnow, CloudFog,
  CloudLightning, CloudDrizzle, Wind, Droplets, Thermometer,
  MapPin, RefreshCw,
} from 'lucide-react';
import type { WeatherData, GPSLocation } from '@/types';
import { fetchWeather, geocodeCity } from '@/lib/weather';

interface WeatherPanelProps {
  gps: GPSLocation;
  cityOverride?: string | null;
}

const ICON_MAP: Record<string, typeof Sun> = {
  Sun, Cloud, CloudSun, CloudRain, CloudSnow, CloudFog, CloudLightning, CloudDrizzle,
};

export default function WeatherPanel({ gps, cityOverride }: WeatherPanelProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const city = cityOverride || gps.city;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(false);

      let lat = gps.latitude;
      let lon = gps.longitude;

      if (!lat || !lon) {
        const coords = await geocodeCity(city);
        if (coords) {
          lat = coords.lat;
          lon = coords.lon;
        } else {
          // Default to Guayaquil
          lat = -2.1709;
          lon = -79.9224;
        }
      }

      const data = await fetchWeather(lat, lon, city);
      if (cancelled) return;

      if (data) {
        setWeather(data);
      } else {
        setError(true);
      }
      setLoading(false);
    };

    load();

    return () => { cancelled = true; };
  }, [gps.latitude, gps.longitude, gps.city, city, cityOverride]);

  const refresh = () => {
    setWeather(null);
    setLoading(true);
    setTimeout(() => {
      const lat = gps.latitude ?? -2.1709;
      const lon = gps.longitude ?? -79.9224;
      fetchWeather(lat, lon, city).then((data) => {
        if (data) {
          setWeather(data);
          setError(false);
        } else {
          setError(true);
        }
        setLoading(false);
      });
    }, 100);
  };

  const WeatherIcon = weather ? (ICON_MAP[weather.icon] ?? Cloud) : Cloud;

  return (
    <div className="hud-panel rounded-lg p-5 relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="font-mono text-[10px] text-amber-500/60 tracking-widest">CLIMA EN VIVO</span>
        </div>
        <button
          onClick={refresh}
          className="text-neutral-500 hover:text-amber-500 transition-colors"
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
        </div>
      ) : error || !weather ? (
        <div className="flex flex-col items-center justify-center h-32 text-neutral-500">
          <Cloud size={32} className="mb-2 opacity-30" />
          <span className="font-mono text-xs">Sin datos climáticos</span>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <WeatherIcon size={40} className="text-amber-500 drop-shadow-[0_0_8px_var(--accent-glow)]" />
              <div>
                <span className="font-display text-3xl text-amber-500 font-bold">{weather.temperature}°</span>
                <p className="font-body text-sm text-neutral-400">{weather.condition}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-neutral-400">
              <MapPin size={12} />
              <span className="font-mono text-xs">{weather.city}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5">
            <div className="flex items-center gap-2">
              <Droplets size={14} className="text-amber-500/60" />
              <div>
                <span className="font-mono text-sm text-neutral-300">{weather.humidity}%</span>
                <p className="font-mono text-[10px] text-neutral-600">HUM</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Wind size={14} className="text-amber-500/60" />
              <div>
                <span className="font-mono text-sm text-neutral-300">{weather.windSpeed}</span>
                <p className="font-mono text-[10px] text-neutral-600">KM/H</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Thermometer size={14} className="text-amber-500/60" />
              <div>
                <span className="font-mono text-sm text-neutral-300">{weather.feelsLike}°</span>
                <p className="font-mono text-[10px] text-neutral-600">SEN</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
