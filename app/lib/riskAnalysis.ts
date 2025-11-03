// app/lib/riskAnalysis.ts

// Definimos los umbrales críticos (100% del riesgo) en mm de lluvia acumulada en 24 horas.
// Esto se basa en el documento de Protección Civil que proporcionaste.
const FLOOD_THRESHOLDS = {
  'REGION 1: SIERRA NORTE DE PUEBLA': 80,
  'REGION 2: HUASTECA HIDALGUENSE': 85,
  'REGION 3: ALTIPLANO HIDALGUENSE': 100,
  'REGION 4: VALLE DE TULANCINGO': 100, // Usamos el umbral de Altiplano/Valle
  'REGION 5: VERTIENTE DEL GOLFO': 90,
  'REGION 6: VALLES POBLANOS': 100, // Usamos el umbral de Altiplano/Valle
  'DEFAULT': 100, // Un valor por defecto por si una región no coincide
};

// Definimos la interfaz para una localización para que nuestro código sea más seguro.
interface Location {
  region: string;
}

// Definimos la interfaz para los datos del clima que esperamos recibir.
interface WeatherData {
  hourly: {
    precipitation: number[];
  };
}

/**
 * Calcula el nivel de riesgo de inundación basado en el pronóstico de lluvia.
 * @param location - El objeto de la población, que incluye su región.
 * @param weatherData - Los datos del clima de la API, que incluyen la lluvia por hora.
 * @returns El nivel de alerta: 'GREEN', 'YELLOW', 'ORANGE', o 'RED'.
 */
export function calculateFloodRisk(location: Location, weatherData: WeatherData | null): string {
  // Si no hay datos del clima, no hay riesgo calculable.
  if (!weatherData || !weatherData.hourly || !weatherData.hourly.precipitation) {
    return 'GREEN'; // O 'GRAY' si prefieres indicar "sin datos"
  }

  // 1. Sumamos toda la lluvia pronosticada para las próximas 24 horas.
  const totalPrecipitation24h = weatherData.hourly.precipitation.reduce((sum, rain) => sum + rain, 0);

  // 2. Obtenemos el umbral crítico para la región de esta localización.
  const criticalThreshold = FLOOD_THRESHOLDS[location.region as keyof typeof FLOOD_THRESHOLDS] || FLOOD_THRESHOLDS.DEFAULT;

  // 3. Comparamos la lluvia pronosticada contra los umbrales de alerta escalonados.
  if (totalPrecipitation24h >= criticalThreshold) {
    return 'RED'; // Emergencia: umbral superado
  } else if (totalPrecipitation24h >= criticalThreshold * 0.85) {
    return 'ORANGE'; // Respuesta: 85% del umbral alcanzado
  } else if (totalPrecipitation24h >= criticalThreshold * 0.70) {
    return 'YELLOW'; // Preparación: 70% del umbral alcanzado
  } else {
    return 'GREEN'; // Prevención: Sin riesgo significativo
  }
}