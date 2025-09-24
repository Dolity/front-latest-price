<template>
  <div class="alerts-view">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Price Alerts</h1>
      <p class="text-gray-600 dark:text-gray-400">Set up notifications for price movements</p>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Create Alert -->
      <div class="lg:col-span-1">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Create Alert</h3>
          <form @submit.prevent="createAlert" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">Symbol</label>
              <select 
                v-model="newAlert.symbol" 
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select symbol</option>
                <option v-for="symbol in watchlistStore.symbols" :key="symbol" :value="symbol">
                  {{ symbol }}
                </option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">Condition</label>
              <select 
                v-model="newAlert.condition" 
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="above">Price goes above</option>
                <option value="below">Price goes below</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">Target Price</label>
              <input 
                v-model.number="newAlert.targetPrice" 
                type="number" 
                step="0.01" 
                required
                placeholder="0.00"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">Note (optional)</label>
              <input 
                v-model="newAlert.note" 
                type="text" 
                placeholder="Add a note..."
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
            </div>
            
            <button 
              type="submit" 
              class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Alert
            </button>
          </form>
        </div>
      </div>
      
      <!-- Active Alerts -->
      <div class="lg:col-span-2">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">Active Alerts</h3>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ activeAlerts.length }} active
            </span>
          </div>
          
          <div v-if="activeAlerts.length === 0" class="text-center py-8">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM12 2l3.09 6.26L22 9l-5 4.74L18.18 21 12 17.27 5.82 21 7 13.74 2 9l6.91-.74L12 2z" />
            </svg>
            <p class="text-gray-500 dark:text-gray-400">No active alerts</p>
            <p class="text-sm text-gray-400 dark:text-gray-500">Create your first alert to get started</p>
          </div>
          
          <div v-else class="space-y-3">
            <div 
              v-for="alert in settingsStore.priceAlerts" 
              :key="alert.id"
              class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
              :class="alert.enabled ? '' : 'opacity-50'"
            >
              <div class="flex-1">
                <div class="flex items-center space-x-3">
                  <div class="font-medium text-gray-900 dark:text-white">{{ alert.symbol }}</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ alert.condition === 'above' ? '↗' : '↘' }}
                    ${{ formatPrice(alert.targetPrice) }}
                  </div>
                  <div 
                    class="px-2 py-1 rounded-full text-xs"
                    :class="alert.enabled ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'"
                  >
                    {{ alert.enabled ? 'Active' : 'Disabled' }}
                  </div>
                </div>
                <div v-if="alert.note" class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {{ alert.note }}
                </div>
                <div class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Created {{ formatDate(alert.createdAt) }}
                </div>
              </div>
              
              <div class="flex items-center space-x-2">
                <button 
                  @click="settingsStore.togglePriceAlert(alert.id)"
                  class="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                  :title="alert.enabled ? 'Disable alert' : 'Enable alert'"
                >
                  <svg v-if="alert.enabled" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM12 2l3.09 6.26L22 9l-5 4.74L18.18 21 12 17.27 5.82 21 7 13.74 2 9l6.91-.74L12 2z" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
                  </svg>
                </button>
                
                <button 
                  @click="settingsStore.removePriceAlert(alert.id)"
                  class="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete alert"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSettingsStore } from '@/stores/settingsStore'
import { useWatchlistStore } from '@/stores/watchlistStore'

const settingsStore = useSettingsStore()
const watchlistStore = useWatchlistStore()

const newAlert = ref({
  symbol: '',
  condition: 'above',
  targetPrice: 0,
  note: ''
})

const activeAlerts = computed(() => 
  settingsStore.priceAlerts.filter(alert => alert.enabled)
)

const createAlert = () => {
  if (newAlert.value.symbol && newAlert.value.targetPrice > 0) {
    settingsStore.addPriceAlert({
      symbol: newAlert.value.symbol,
      condition: newAlert.value.condition,
      targetPrice: newAlert.value.targetPrice,
      note: newAlert.value.note
    })
    
    // Reset form
    newAlert.value = {
      symbol: '',
      condition: 'above',
      targetPrice: 0,
      note: ''
    }
  }
}

const formatPrice = (price) => {
  if (typeof price !== 'number') return '0.00'
  if (price < 1) return price.toFixed(4)
  return price.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>
