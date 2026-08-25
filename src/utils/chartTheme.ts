import { Chart as ChartJS, registerables } from 'chart.js'

// Register all chart.js components globally to prevent undefined defaults errors at import time
ChartJS.register(...registerables)

// Shared visual defaults for every Chart.js graph in the application.
// Individual charts can still override these when a different treatment is useful.
ChartJS.defaults.color = '#64748B'
ChartJS.defaults.font.family = "Inter, Segoe UI, system-ui, sans-serif"
ChartJS.defaults.font.size = 10
ChartJS.defaults.plugins.legend.labels.usePointStyle = true
ChartJS.defaults.plugins.legend.labels.pointStyle = 'circle'
ChartJS.defaults.plugins.legend.labels.padding = 16
ChartJS.defaults.plugins.tooltip.backgroundColor = '#172033'
ChartJS.defaults.plugins.tooltip.titleColor = '#FFFFFF'
ChartJS.defaults.plugins.tooltip.bodyColor = '#E2E8F0'
ChartJS.defaults.plugins.tooltip.borderColor = 'rgba(255,255,255,0.12)'
ChartJS.defaults.plugins.tooltip.borderWidth = 1
ChartJS.defaults.plugins.tooltip.cornerRadius = 8
ChartJS.defaults.plugins.tooltip.padding = 10

export const chartGrid = 'rgba(148, 163, 184, 0.16)'
export const chartAxis = {
  border: { display: false },
  ticks: { color: '#64748B', font: { size: 10 } },
}

