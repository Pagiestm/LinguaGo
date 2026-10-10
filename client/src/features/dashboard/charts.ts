import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  DoughnutController,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
);

export const LEVEL_COLORS: Record<string, string> = {
  A1: '#22c55e',
  A2: '#f59e0b',
  B1: '#3b82f6',
  B2: '#a855f7',
  C1: '#ef4444',
};

export const CHART_TEXT_COLOR = '#94a3b8';
export const CHART_GRID_COLOR = 'rgba(148,163,184,0.15)';
