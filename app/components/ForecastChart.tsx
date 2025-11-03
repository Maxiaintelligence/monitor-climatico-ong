// app/components/ForecastChart.tsx
'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ForecastChartProps {
  hourlyData: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: number[];
  };
}

export default function ForecastChart({ hourlyData }: ForecastChartProps) {
  const data = {
    labels: hourlyData.time.map(t => new Date(t).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })),
    datasets: [
      {
        label: 'Temperatura (°C)',
        data: hourlyData.temperature_2m,
        borderColor: '#BB86FC',
        backgroundColor: 'rgba(187, 134, 252, 0.2)',
        yAxisID: 'y',
        fill: true,
      },
      {
        label: 'Prob. de Lluvia (%)',
        data: hourlyData.precipitation_probability,
        borderColor: '#03DAC6',
        backgroundColor: 'rgba(3, 218, 198, 0.1)',
        yAxisID: 'y1',
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#B3B3B3',
        },
      },
      title: {
        display: true,
        text: 'Pronóstico para las Próximas 48 Horas',
        color: 'white',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#B3B3B3' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Temperatura (°C)',
          color: '#BB86FC',
        },
        ticks: { color: '#BB86FC' },
        grid: { drawOnChartArea: false },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        max: 100, // La probabilidad va de 0 a 100
        title: {
          display: true,
          text: 'Prob. Lluvia (%)',
          color: '#03DAC6',
        },
        ticks: { color: '#03DAC6' },
        grid: { drawOnChartArea: false },
      },
    },
  };

  return <Line options={options} data={data} />;
}