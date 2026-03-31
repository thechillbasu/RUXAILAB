<template>
  <div class="bubble-chart-wrapper">
    <canvas ref="chartCanvas" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { Chart, BubbleController, PointElement, LinearScale, Tooltip, Legend } from 'chart.js'

Chart.register(BubbleController, PointElement, LinearScale, Tooltip, Legend)

const props = defineProps({
  issues: {
    type: Array,
    default: () => [],
  },
})

const chartCanvas = ref(null)
let chartInstance = null

const sevWeight = { critical: 4, high: 3, medium: 2, low: 1 }
const sevColor = {
  critical: 'rgba(198, 40, 40, 0.75)',
  high: 'rgba(216, 67, 21, 0.75)',
  medium: 'rgba(239, 108, 0, 0.75)',
  low: 'rgba(46, 125, 50, 0.75)',
}
const sevBorder = {
  critical: '#C62828',
  high: '#D84315',
  medium: '#EF6C00',
  low: '#2E7D32',
}

function buildData(issues) {
  const grouped = {}
  issues.forEach((issue) => {
    const key = `${issue.category}::${issue.description}`
    if (!grouped[key]) {
      grouped[key] = { ...issue, frequency: 0, evaluators: new Set() }
    }
    grouped[key].frequency++
    grouped[key].evaluators.add(issue.evaluator)
  })

  const entries = Object.values(grouped)

  const datasets = ['critical', 'high', 'medium', 'low'].map((sev) => {
    const points = entries
      .filter((e) => e.severity === sev)
      .map((e) => ({
        x: e.evaluators.size,
        y: sevWeight[e.severity] + (Math.random() * 0.2 - 0.1),
        r: Math.max(8, Math.min(28, e.frequency * 8)),
        label: `${e.category}: ${e.description}`,
        freq: e.frequency,
        evalCount: e.evaluators.size,
      }))

    return {
      label: sev.charAt(0).toUpperCase() + sev.slice(1),
      data: points,
      backgroundColor: sevColor[sev],
      borderColor: sevBorder[sev],
      borderWidth: 2,
      hoverBorderWidth: 3,
      hoverRadius: 4,
    }
  }).filter((ds) => ds.data.length > 0)

  return datasets
}

function render() {
  if (!chartCanvas.value) return
  if (chartInstance) chartInstance.destroy()

  const datasets = buildData(props.issues)

  chartInstance = new Chart(chartCanvas.value, {
    type: 'bubble',
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: { left: 10, right: 20, top: 20, bottom: 10 },
      },
      scales: {
        x: {
          title: { display: true, text: 'Evaluators Reporting', font: { size: 13, weight: '600' }, color: '#546E7A' },
          min: 0,
          ticks: { stepSize: 1, color: '#78909C', font: { size: 11 } },
          grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false },
        },
        y: {
          title: { display: true, text: 'Severity', font: { size: 13, weight: '600' }, color: '#546E7A' },
          min: 0.5,
          max: 4.5,
          ticks: {
            stepSize: 1,
            color: '#78909C',
            font: { size: 11, weight: '500' },
            callback: (v) => {
              const map = { 1: '🟢 Low', 2: '🟡 Medium', 3: '🟠 High', 4: '🔴 Critical' }
              return map[v] || ''
            },
          },
          grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 16,
            font: { size: 12, weight: '500' },
            color: '#546E7A',
          },
        },
        tooltip: {
          backgroundColor: 'rgba(33,33,33,0.9)',
          titleFont: { size: 13, weight: '600' },
          bodyFont: { size: 12 },
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            title: (items) => items[0]?.raw?.label || '',
            label: (ctx) => {
              const d = ctx.raw
              return `${d.evalCount} evaluator${d.evalCount > 1 ? 's' : ''} · ${d.freq} report${d.freq > 1 ? 's' : ''}`
            },
          },
        },
      },
    },
  })
}

watch(() => props.issues, render, { deep: true })
onMounted(() => setTimeout(render, 100))
onUnmounted(() => { if (chartInstance) chartInstance.destroy() })
</script>

<style scoped>
.bubble-chart-wrapper {
  position: relative;
  height: 340px;
  width: 100%;
  background: linear-gradient(135deg, #fafbfd 0%, #f5f7fa 100%);
  border-radius: 12px;
  padding: 8px;
}
</style>
