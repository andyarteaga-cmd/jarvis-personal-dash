import type { WeatherData } from '@/types';

const WEATHER_CODES: Record<number, { condition: string; icon: string }> = {
  0: { condition: 'Despejado', icon: 'Sun' },
  1: { condition: 'Mayormente despejado', icon: 'Sun' },
  2: { condition: 'Parcialmente nublado', icon: 'CloudSun' },
  3: { condition: 'Nublado', icon: 'Cloud' },
  45: { condition: 'Niebla', icon: 'CloudFog' },
  48: { condition: 'Niebla helada', icon: 'CloudFog' },
  51: { condition: 'Llovizna ligera', icon: 'CloudDrizzle' },
  53: { condition: 'Llovizna', icon: 'CloudDrizzle' },
  55: { condition: 'Llovizna densa', icon: 'CloudDrizzle' },
  61: { condition: 'Lluvia ligera', icon: 'CloudRain' },
  63: { condition: 'Lluvia', icon: 'CloudRain' },
  65: { condition: 'Lluvia fuerte', icon: 'CloudRain' },
  71: { condition: 'Nieve ligera', icon: 'CloudSnow' },
  73: { condition: 'Nevando', icon: 'CloudSnow' },
  75: { condition: 'Nieve fuerte', icon: 'CloudSnow' },
  80: { condition: 'Chubascos', icon: 'CloudRain' },
  81: { condition: 'Lluvia', icon: 'CloudRain' },
  82: { condition: 'Tormenta', icon: 'CloudRain' },
  95: { condition: 'Tormenta eléctrica', icon: 'CloudLightning' },
  96: { condition: 'Tormenta con granizo', icon: 'CloudLightning' },
  99: { condition: 'Tormenta severa', icon: 'CloudLightning' },
};

export async function fetchWeather(lat: number, lon: number, cityName: string): Promise<WeatherData | null> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const current = data.current;
    if (!current) return null;

    const code = current.weather_code as number;
    const weatherInfo = WEATHER_CODES[code] ?? { condition: 'Desconocido', icon: 'Cloud' };

    return {
      temperature: Math.round(current.temperature_2m),
      condition: weatherInfo.condition,
      icon: weatherInfo.icon,
      city: cityName,
      humidity: Math.round(current.relative_humidity_2m),
      windSpeed: Math.round(current.wind_speed_10m),
      feelsLike: Math.round(current.apparent_temperature),
    };
  } catch {
    return null;
  }
}

export async function geocodeCity(cityName: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=es&format=json`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      return { lat: data.results[0].latitude, lon: data.results[0].longitude };
    }
    return null;
  } catch {
    return null;
  }
}
