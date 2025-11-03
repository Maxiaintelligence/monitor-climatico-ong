// app/lib/riskAnalysis.ts (VERSIÓN FINAL CON TODOS LOS UMBRALES)

// --- INTERFACES DE DATOS ---
interface Location {
  region: string;
}

interface WeatherData {
  hourly?: {
    precipitation?: number[];
    relativehumidity_2m?: number[];
  };
  daily?: {
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    windgusts_10m_max?: number[];
    precipitation_sum?: number[];
  };
}

// --- UMBRALES DE RIESGO COMPLETOS ---
const FLOOD_THRESHOLDS = {
  'REGION 1: SIERRA NORTE DE PUEBLA': 80,
  'REGION 2: HUASTECA HIDALGUENSE': 85,
  'REGION 3: ALTIPLANO HIDALGUENSE': 100,
  'REGION 4: VALLE DE TULANCINGO': 100,
  'REGION 5: VERTIENTE DEL GOLFO': 90,
  'REGION 6: VALLES POBLANOS': 100,
  'DEFAULT': 100,
};
const FROST_THRESHOLDS = {
  'REGION 1: SIERRA NORTE DE PUEBLA': { severe: 0, moderate: 2 },
  'REGION 3: ALTIPLANO HIDALGUENSE': { severe: 0, moderate: 2 },
  'REGION 4: VALLE DE TULANCINGO': { severe: 0, moderate: 2 },
  'REGION 6: VALLES POBLANOS': { severe: 0, moderate: 2 },
};
const HEATWAVE_THRESHOLDS = {
  'REGION 2: HUASTECA HIDALGUENSE': 36,
  'REGION 3: ALTIPLANO HIDALGUENSE': 32,
  'REGION 5: VERTIENTE DEL GOLFO': 36,
};
const WIND_THRESHOLDS = {
  'REGION 2: HUASTECA HIDALGUENSE': { gusts: 80 },
  'REGION 3: ALTIPLANO HIDALGUENSE': { gusts: 90 },
  'REGION 5: VERTIENTE DEL GOLFO': { gusts: 80 },
};
const FIRE_THRESHOLDS = {
    'REGION 3: ALTIPLANO HIDALGUENSE': { temp: 28, humidity: 25, wind: 20 },
    'REGION 6: VALLES POBLANOS': { temp: 32, humidity: 20, wind: 25 },
};

// --- FUNCIONES DE ANÁLISIS INDIVIDUALES ROBUSTAS ---

function calculateFloodRisk(location: Location, weather: WeatherData) {
  const totalPrecipitation24h = weather.daily?.precipitation_sum?.[0];
  if (totalPrecipitation24h === undefined) return { level: 'GREEN', reason: '' };
  const criticalThreshold = FLOOD_THRESHOLDS[location.region as keyof typeof FLOOD_THRESHOLDS] || FLOOD_THRESHOLDS.DEFAULT;
  if (totalPrecipitation24h >= criticalThreshold) return { level: 'RED', reason: 'Riesgo de Inundación' };
  if (totalPrecipitation24h >= criticalThreshold * 0.85) return { level: 'ORANGE', reason: 'Riesgo de Inundación' };
  if (totalPrecipitation24h >= criticalThreshold * 0.70) return { level: 'YELLOW', reason: 'Riesgo de Inundación' };
  return { level: 'GREEN', reason: '' };
}

function calculateFrostRisk(location: Location, weather: WeatherData) {
  const minTemp = weather.daily?.temperature_2m_min?.[0];
  if (minTemp === undefined) return { level: 'GREEN', reason: '' };
  const thresholds = FROST_THRESHOLDS[location.region as keyof typeof FROST_THRESHOLDS];
  if (!thresholds) return { level: 'GREEN', reason: '' };
  if (minTemp <= thresholds.severe) return { level: 'RED', reason: 'Riesgo de Helada Severa' };
  if (minTemp <= thresholds.moderate) return { level: 'ORANGE', reason: 'Riesgo de Helada Moderada' };
  return { level: 'GREEN', reason: '' };
}

function calculateHeatwaveRisk(location: Location, weather: WeatherData) {
  const maxTemp = weather.daily?.temperature_2m_max?.[0];
  if (maxTemp === undefined) return { level: 'GREEN', reason: '' };
  const threshold = HEATWAVE_THRESHOLDS[location.region as keyof typeof HEATWAVE_THRESHOLDS];
  if (!threshold) return { level: 'GREEN', reason: '' };
  if (maxTemp >= threshold) return { level: 'ORANGE', reason: 'Riesgo por Ola de Calor' };
  return { level: 'GREEN', reason: '' };
}

function calculateWindRisk(location: Location, weather: WeatherData) {
    const maxGust = weather.daily?.windgusts_10m_max?.[0];
    if (maxGust === undefined) return { level: 'GREEN', reason: '' };
    const thresholds = WIND_THRESHOLDS[location.region as keyof typeof WIND_THRESHOLDS];
    if (!thresholds) return { level: 'GREEN', reason: '' };
    if (maxGust >= thresholds.gusts) return { level: 'ORANGE', reason: 'Riesgo por Vientos Fuertes' };
    return { level: 'GREEN', reason: '' };
}

function calculateFireRisk(location: Location, weather: WeatherData) {
    const thresholds = FIRE_THRESHOLDS[location.region as keyof typeof FIRE_THRESHOLDS];
    if (!thresholds) return { level: 'GREEN', reason: '' };
    const maxTemp = weather.daily?.temperature_2m_max?.[0];
    const minHumidity = weather.hourly?.relativehumidity_2m ? Math.min(...weather.hourly.relativehumidity_2m) : undefined;
    const maxGust = weather.daily?.windgusts_10m_max?.[0];
    if (maxTemp === undefined || minHumidity === undefined || maxGust === undefined) return { level: 'GREEN', reason: '' };
    if (maxTemp > thresholds.temp && minHumidity < thresholds.humidity && maxGust > thresholds.wind) return { level: 'ORANGE', reason: 'Riesgo de Incendio Forestal' };
    return { level: 'GREEN', reason: '' };
}

// --- FUNCIÓN MAESTRA DE DECISIÓN ---
const RISK_PRIORITY = { RED: 4, ORANGE: 3, YELLOW: 2, GREEN: 1 };

export function calculateOverallRisk(location: Location, weatherData: WeatherData | null) {
  if (!weatherData) return { level: 'GREEN', reason: 'Sin datos' };

  const floodRisk = calculateFloodRisk(location, weatherData);
  const frostRisk = calculateFrostRisk(location, weatherData);
  const heatwaveRisk = calculateHeatwaveRisk(location, weatherData);
  const windRisk = calculateWindRisk(location, weatherData);
  const fireRisk = calculateFireRisk(location, weatherData);

  const activeRisks = [floodRisk, frostRisk, heatwaveRisk, windRisk, fireRisk].filter(risk => risk.level !== 'GREEN');
  if (activeRisks.length === 0) return { level: 'GREEN', reason: '' };

  const highestRisk = activeRisks.reduce((max, current) => 
    RISK_PRIORITY[current.level as keyof typeof RISK_PRIORITY] > RISK_PRIORITY[max.level as keyof typeof RISK_PRIORITY] ? current : max
  );
  return highestRisk;
}