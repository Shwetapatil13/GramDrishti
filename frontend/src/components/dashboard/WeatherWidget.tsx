import React, { useEffect, useState } from 'react';
import { Cloud, Droplets, ThermometerSun } from 'lucide-react';
import { useVillageSelection } from '@/hooks/useVillageSelection';
import { apiService } from '@/services/api';
import { useTranslation } from 'react-i18next';

interface WeatherData {
  temperature_c?: number;
  rainfall_mm?: number;
  humidity_percent?: number;
  wind_speed_kmh?: number;
}

export const WeatherWidget: React.FC = () => {
  const { t } = useTranslation();
  const { selectedVillage } = useVillageSelection();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    if (!selectedVillage) return;

    let mounted = true;
    const fetchWeather = async () => {
      setLoading(true);
      setWeatherError(null);

      try {
        const data = await apiService.get<WeatherData>(`/api/v1/weather/${selectedVillage.id}/current`);

        if (mounted) {
          setWeather(data);
          setLastUpdated(new Date());
        }
      } catch (err: any) {
        const isOffline = err?.code === 'ERR_NETWORK' || !err?.response;
        const msg = isOffline
          ? 'Backend offline — start the server'
          : `HTTP ${err?.response?.status}: ${err?.response?.data?.detail || err?.message}`;


        if (mounted) setWeatherError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 10 * 60 * 1000); // 10 mins

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [selectedVillage]);

  if (!selectedVillage) return null;

  return (
    <div className="p-4 border-b border-surface-border bg-surface-slate/30">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-mono text-text-secondary text-xs">{t('dashboard.current_weather', 'CURRENT WEATHER')}</h4>
        <Cloud className="w-4 h-4 text-brand-blue" />
      </div>

      {loading && !weather ? (
        <div className="animate-pulse flex flex-col gap-2">
          <div className="h-6 bg-surface-border rounded w-1/2"></div>
          <div className="h-4 bg-surface-border rounded w-1/3"></div>
        </div>
      ) : weather ? (
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <ThermometerSun className="w-4 h-4 text-semantic-warning" />
              <span className="text-heading-md text-text-primary">
                {weather.temperature_c?.toFixed(1)}°C
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Droplets className="w-4 h-4 text-brand-blue" />
              <span className="text-body text-text-secondary">
                {weather.rainfall_mm?.toFixed(1)} mm
              </span>
            </div>
          </div>
          <div className="text-[10px] font-mono text-text-muted">
            {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      ) : weatherError ? (
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-semantic-warning font-mono">{t('dashboard.weather_unavailable', 'Weather unavailable')}</span>
          <span className="text-[10px] text-text-muted break-all">{weatherError}</span>
        </div>
      ) : (
        <span className="text-body text-text-muted">{t('dashboard.unavailable', 'Unavailable')}</span>
      )}
    </div>
  );
};