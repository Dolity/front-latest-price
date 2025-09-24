<template>
  <header class="app-header bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700">
    <div class="container mx-auto px-4 py-4">
      <div class="flex justify-between items-center">
        <!-- Logo and Title -->
        <div class="flex items-center space-x-4">
          <div class="logo">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">{{ appTitle }}</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">Real-time Price Tracker</p>
          </div>
        </div>

        <!-- Search Bar -->
        <div class="search-container flex-1 max-w-md mx-8">
          <div class="relative">
            <input 
              v-model="searchQuery"
              @input="handleSearch"
              @focus="showSearchResults = true"
              @blur="hideSearchResults"
              type="text" 
              placeholder="Search symbols (e.g., AAPL, BTCUSDT)"
              class="w-full px-4 py-2 pl-10 pr-4 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
            >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute left-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>

            <!-- Search Results Dropdown -->
            <div 
              v-if="showSearchResults && searchResults.length > 0"
              class="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
            >
              <div 
                v-for="result in searchResults" 
                :key="result.symbol"
                @mousedown="selectSymbol(result)"
                class="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0"
              >
                <div class="flex justify-between items-center">
                  <div>
                    <div class="font-medium text-gray-900 dark:text-white">{{ result.symbol }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">{{ result.description || result.name }}</div>
                  </div>
                  <div class="text-right">
                    <div class="font-medium text-gray-900 dark:text-white">${{ formatPrice(result.price) }}</div>
                    <div class="text-sm" :class="result.change >= 0 ? 'text-green-500' : 'text-red-500'">
                      {{ result.change >= 0 ? '+' : '' }}{{ result.change?.toFixed(2) }}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Header Actions -->
        <div class="header-actions flex items-center space-x-4">
          <!-- Market Status -->
          <div class="market-status hidden md:flex items-center space-x-2">
            <div class="flex items-center space-x-1">
              <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span class="text-sm text-gray-600 dark:text-gray-400">Market Open</span>
            </div>
          </div>

          <!-- Theme Toggle -->
          <button 
            @click="toggleTheme"
            class="theme-toggle p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            :title="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <svg v-if="theme === 'dark'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>

          <!-- Settings -->
          <button 
            @click="showSettings = !showSettings"
            class="settings-btn p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          <!-- Notifications -->
          <button 
            @click="showNotifications = !showNotifications"
            class="notifications-btn relative p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Notifications"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM12 2l3.09 6.26L22 9l-5 4.74L18.18 21 12 17.27 5.82 21 7 13.74 2 9l6.91-.74L12 2z" />
            </svg>
            <div v-if="unreadNotifications > 0" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {{ unreadNotifications }}
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Settings Dropdown -->
    <div v-if="showSettings" class="absolute top-full right-4 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50">
      <div class="p-4">
        <h3 class="font-medium text-gray-900 dark:text-white mb-3">Settings</h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600 dark:text-gray-400">Auto Refresh</span>
            <button 
              @click="settingsStore.toggleAutoRefresh()"
              class="toggle-btn"
              :class="settingsStore.autoRefresh ? 'bg-blue-500' : 'bg-gray-300'"
            >
              <div class="toggle-dot" :class="settingsStore.autoRefresh ? 'translate-x-4' : 'translate-x-0'"></div>
            </button>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600 dark:text-gray-400">Notifications</span>
            <button 
              @click="settingsStore.toggleNotifications()"
              class="toggle-btn"
              :class="settingsStore.notifications ? 'bg-blue-500' : 'bg-gray-300'"
            >
              <div class="toggle-dot" :class="settingsStore.notifications ? 'translate-x-4' : 'translate-x-0'"></div>
            </button>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600 dark:text-gray-400">Sound</span>
            <button 
              @click="settingsStore.toggleSound()"
              class="toggle-btn"
              :class="settingsStore.soundEnabled ? 'bg-blue-500' : 'bg-gray-300'"
            >
              <div class="toggle-dot" :class="settingsStore.soundEnabled ? 'translate-x-4' : 'translate-x-0'"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { useSettingsStore } from '@/stores/settingsStore'
import { useWatchlistStore } from '@/stores/watchlistStore'
import { finnhubApi } from '@/services/api/finnhubApi'

const { theme, toggleTheme } = useTheme()
const settingsStore = useSettingsStore()
const watchlistStore = useWatchlistStore()

const searchQuery = ref('')
const searchResults = ref([])
const showSearchResults = ref(false)
const showSettings = ref(false)
const showNotifications = ref(false)
const unreadNotifications = ref(0)

const appTitle = computed(() => settingsStore.appTitle)

let searchTimeout = null

const handleSearch = async () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  if (searchQuery.value.length < 2) {
    searchResults.value = []
    return
  }

  searchTimeout = setTimeout(async () => {
    try {
      // Search both stocks and crypto
      const stockResults = await finnhubApi.searchSymbols(searchQuery.value)
      
      // Mock crypto results (in real app, use CoinGecko API)
      const cryptoResults = [
        { symbol: 'BINANCE:BTCUSDT', name: 'Bitcoin', price: 45000, change: 2.5 },
        { symbol: 'BINANCE:ETHUSDT', name: 'Ethereum', price: 3200, change: -1.2 },
        { symbol: 'BINANCE:ADAUSDT', name: 'Cardano', price: 0.85, change: 5.8 }
      ].filter(crypto => 
        crypto.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchQuery.value.toLowerCase())
      )

      searchResults.value = [
        ...stockResults.slice(0, 5).map(stock => ({
          symbol: stock.symbol,
          description: stock.description,
          price: Math.random() * 1000, // Mock price
          change: (Math.random() - 0.5) * 10 // Mock change
        })),
        ...cryptoResults
      ].slice(0, 8)
    } catch (error) {
      console.error('Search error:', error)
      searchResults.value = []
    }
  }, 300)
}

const selectSymbol = (result) => {
  watchlistStore.addSymbol(result.symbol)
  searchQuery.value = ''
  searchResults.value = []
  showSearchResults.value = false
}

const hideSearchResults = () => {
  setTimeout(() => {
    showSearchResults.value = false
  }, 200)
}

const formatPrice = (price) => {
  if (typeof price !== 'number') return '0.00'
  if (price < 1) return price.toFixed(4)
  return price.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
}

onMounted(() => {
  settingsStore.loadFromLocalStorage()
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.settings-btn')) {
      showSettings.value = false
    }
    if (!e.target.closest('.notifications-btn')) {
      showNotifications.value = false
    }
  })
})
</script>

<style scoped>
.toggle-btn {
  @apply relative inline-flex h-6 w-11 items-center rounded-full transition-colors;
}

.toggle-dot {
  @apply inline-block h-4 w-4 transform rounded-full bg-white transition-transform;
}

.search-container {
  min-width: 300px;
}

@media (max-width: 768px) {
  .search-container {
    display: none;
  }
  
  .market-status {
    display: none !important;
  }
}
</style>
