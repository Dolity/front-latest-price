<template>
  <div class="watchlist bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
    <div class="header flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">My Watchlist</h2>
      <div class="flex gap-2">
        <button 
          @click="showAddSymbol = true"
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Symbol
        </button>
        <button 
          @click="refreshPrices"
          class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
          :disabled="isRefreshing"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" :class="{ 'animate-spin': isRefreshing }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
    </div>

    <!-- Connection Status -->
    <div class="connection-status mb-4 flex gap-4 text-sm">
      <div class="flex items-center gap-2">
        <div 
          class="w-3 h-3 rounded-full"
          :class="priceStore.connectionStatus.finnhub ? 'bg-green-500' : 'bg-red-500'"
        ></div>
        <span class="text-gray-600 dark:text-gray-400">Finnhub</span>
      </div>
      <div class="flex items-center gap-2">
        <div 
          class="w-3 h-3 rounded-full"
          :class="priceStore.connectionStatus.binance ? 'bg-green-500' : 'bg-red-500'"
        ></div>
        <span class="text-gray-600 dark:text-gray-400">Binance</span>
      </div>
    </div>

    <!-- Symbols Grid -->
    <div class="symbols grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <PriceWidget 
        v-for="symbol in watchlist" 
        :key="symbol" 
        :symbol="symbol"
        @remove="removeSymbol"
      />
    </div>

    <!-- Empty State -->
    <div v-if="watchlist.length === 0" class="empty-state text-center py-12">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No symbols in watchlist</h3>
      <p class="text-gray-500 dark:text-gray-400 mb-4">Add some symbols to start tracking prices</p>
      <button 
        @click="showAddSymbol = true"
        class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
      >
        Add Your First Symbol
      </button>
    </div>

    <!-- Add Symbol Modal -->
    <div v-if="showAddSymbol" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="showAddSymbol = false">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4" @click.stop>
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Add Symbol to Watchlist</h3>
        
        <div class="mb-4">
          <input 
            v-model="newSymbol"
            @keyup.enter="addSymbol"
            type="text" 
            placeholder="Enter symbol (e.g., AAPL, BINANCE:BTCUSDT)"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
        </div>

        <div class="mb-4">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Popular symbols:</p>
          <div class="flex flex-wrap gap-2">
            <button 
              v-for="popular in popularSymbols" 
              :key="popular"
              @click="newSymbol = popular"
              class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {{ popular }}
            </button>
          </div>
        </div>

        <div class="flex gap-3">
          <button 
            @click="addSymbol"
            class="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors duration-200"
            :disabled="!newSymbol.trim()"
          >
            Add Symbol
          </button>
          <button 
            @click="showAddSymbol = false"
            class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useWatchlistStore } from '@/stores/watchlistStore'
import { usePriceStore } from '@/stores/priceStore'
import PriceWidget from '@/components/widgets/PriceWidget.vue'

const watchlistStore = useWatchlistStore()
const priceStore = usePriceStore()

const showAddSymbol = ref(false)
const newSymbol = ref('')
const isRefreshing = ref(false)

const watchlist = computed(() => watchlistStore.symbols)

const popularSymbols = [
  'AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'META',
  'BINANCE:BTCUSDT', 'BINANCE:ETHUSDT', 'BINANCE:ADAUSDT',
  'BINANCE:SOLUSDT', 'BINANCE:DOTUSDT', 'BINANCE:LINKUSDT'
]

const addSymbol = () => {
  if (newSymbol.value.trim()) {
    watchlistStore.addSymbol(newSymbol.value.trim())
    priceStore.subscribeToSymbol(newSymbol.value.trim().toUpperCase())
    newSymbol.value = ''
    showAddSymbol.value = false
  }
}

const removeSymbol = (symbol) => {
  watchlistStore.removeSymbol(symbol)
  priceStore.unsubscribeFromSymbol(symbol)
}

const refreshPrices = async () => {
  isRefreshing.value = true
  try {
    // Reconnect to all symbols
    priceStore.disconnectAll()
    await new Promise(resolve => setTimeout(resolve, 1000)) // Wait a bit
    priceStore.connectToAll(watchlist.value)
  } finally {
    setTimeout(() => {
      isRefreshing.value = false
    }, 2000)
  }
}

onMounted(() => {
  // Connect to WebSocket feeds for all symbols in watchlist
  if (watchlist.value.length > 0) {
    priceStore.connectToAll(watchlist.value)
  }
})

onUnmounted(() => {
  // Clean up connections when component is destroyed
  priceStore.disconnectAll()
})
</script>

<style scoped>
.watchlist {
  min-height: 400px;
}

.symbols {
  min-height: 200px;
}

@media (max-width: 768px) {
  .symbols {
    grid-template-columns: 1fr;
  }
}
</style>
