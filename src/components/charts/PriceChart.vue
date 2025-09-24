<template>
  <div class="price-chart bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
    <div class="chart-header flex justify-between items-center mb-4">
      <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ symbol }} Price Chart</h3>
      <div class="chart-controls flex gap-2">
        <select 
          v-model="timeframe" 
          @change="updateChart"
          class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm border border-gray-300 dark:border-gray-600"
        >
          <option value="1m">1M</option>
          <option value="5m">5M</option>
          <option value="15m">15M</option>
          <option value="1h">1H</option>
          <option value="4h">4H</option>
          <option value="1d">1D</option>
        </select>
        <button 
          @click="toggleChartType"
          class="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm transition-colors"
        >
          {{ chartType === 'line' ? 'Line' : 'Candlestick' }}
        </button>
      </div>
    </div>

    <div class="chart-container relative">
      <canvas 
        ref="chartCanvas" 
        class="w-full h-80"
        :class="{ 'opacity-50': isLoading }"
      ></canvas>
      
      <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>

      <div v-if="error" class="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded">
        <div class="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-gray-500 dark:text-gray-400">{{ error }}</p>
          <button 
            @click="retryLoad"
            class="mt-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    </div>

    <!-- Chart Stats -->
    <div class="chart-stats mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      <div class="stat-item">
        <span class="text-gray-500 dark:text-gray-400">Current</span>
        <div class="font-bold text-gray-900 dark:text-white">${{ formatPrice(currentPrice) }}</div>
      </div>
      <div class="stat-item">
        <span class="text-gray-500 dark:text-gray-400">24h Change</span>
        <div class="font-bold" :class="changeClass">${{ formatChange(priceChange) }}</div>
      </div>
      <div class="stat-item">
        <span class="text-gray-500 dark:text-gray-400">High</span>
        <div class="font-bold text-gray-900 dark:text-white">${{ formatPrice(dayHigh) }}</div>
      </div>
      <div class="stat-item">
        <span class="text-gray-500 dark:text-gray-400">Low</span>
        <div class="font-bold text-gray-900 dark:text-white">${{ formatPrice(dayLow) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { usePriceStore } from '@/stores/priceStore'
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const props = defineProps({
  symbol: {
    type: String,
    required: true
  }
})

const priceStore = usePriceStore()

const chartCanvas = ref(null)
const chart = ref(null)
const timeframe = ref('1h')
const chartType = ref('line')
const isLoading = ref(false)
const error = ref(null)

const currentPrice = computed(() => priceStore.getPrice(props.symbol))
const priceChange = computed(() => priceStore.getChange(props.symbol))
const priceHistory = computed(() => priceStore.getPriceHistory(props.symbol))

// Mock data for demonstration (in real app, this would come from API)
const dayHigh = computed(() => {
  const history = priceHistory.value
  if (history.length === 0) return currentPrice.value
  return Math.max(...history.map(h => h.price))
})

const dayLow = computed(() => {
  const history = priceHistory.value
  if (history.length === 0) return currentPrice.value
  return Math.min(...history.map(h => h.price))
})

const changeClass = computed(() => {
  const change = priceChange.value
  if (change > 0) return 'text-green-500'
  if (change < 0) return 'text-red-500'
  return 'text-gray-500 dark:text-gray-400'
})

const formatPrice = (price) => {
  if (typeof price !== 'number') return '0.00'
  if (price < 1) return price.toFixed(4)
  return price.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
}

const formatChange = (change) => {
  if (typeof change !== 'number') return '0.00'
  const sign = change > 0 ? '+' : ''
  return `${sign}${change.toFixed(2)}`
}

const createChart = () => {
  if (!chartCanvas.value) return

  const ctx = chartCanvas.value.getContext('2d')
  
  // Destroy existing chart
  if (chart.value) {
    chart.value.destroy()
  }

  const history = priceHistory.value
  const labels = history.map(h => new Date(h.timestamp).toLocaleTimeString())
  const data = history.map(h => h.price)

  chart.value = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: `${props.symbol} Price`,
        data: data,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: 'white',
          bodyColor: 'white',
          borderColor: 'rgba(59, 130, 246, 0.5)',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              return `Price: $${formatPrice(context.parsed.y)}`
            }
          }
        }
      },
      scales: {
        x: {
          display: true,
          grid: {
            display: false
          },
          ticks: {
            maxTicksLimit: 6,
            color: '#6B7280'
          }
        },
        y: {
          display: true,
          grid: {
            color: 'rgba(107, 114, 128, 0.1)'
          },
          ticks: {
            color: '#6B7280',
            callback: function(value) {
              return '$' + formatPrice(value)
            }
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    }
  })
}

const updateChart = () => {
  isLoading.value = true
  error.value = null
  
  // Simulate loading delay
  setTimeout(() => {
    try {
      createChart()
      isLoading.value = false
    } catch (err) {
      error.value = 'Failed to load chart data'
      isLoading.value = false
    }
  }, 500)
}

const toggleChartType = () => {
  chartType.value = chartType.value === 'line' ? 'candlestick' : 'line'
  updateChart()
}

const retryLoad = () => {
  updateChart()
}

// Watch for price history changes and update chart
watch(priceHistory, () => {
  if (chart.value && priceHistory.value.length > 0) {
    const history = priceHistory.value
    const labels = history.map(h => new Date(h.timestamp).toLocaleTimeString())
    const data = history.map(h => h.price)
    
    chart.value.data.labels = labels
    chart.value.data.datasets[0].data = data
    chart.value.update('none') // Update without animation for real-time feel
  }
}, { deep: true })

onMounted(async () => {
  await nextTick()
  updateChart()
})

onUnmounted(() => {
  if (chart.value) {
    chart.value.destroy()
  }
})
</script>

<style scoped>
.chart-container {
  height: 320px;
}

.stat-item {
  text-align: center;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background-color: rgba(0, 0, 0, 0.02);
}

.dark .stat-item {
  background-color: rgba(255, 255, 255, 0.02);
}
</style>
