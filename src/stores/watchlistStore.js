import { defineStore } from 'pinia'
import { ref, onMounted, watch } from 'vue'

export const useWatchlistStore = defineStore('watchlist', () => {
  const symbols = ref([])

  onMounted(() => {
    const savedSymbols = localStorage.getItem('watchlist')
    if (savedSymbols) {
      symbols.value = JSON.parse(savedSymbols)
    } else {
      // Default watchlist
      symbols.value = ['AAPL', 'GOOGL', 'MSFT', 'BINANCE:BTCUSDT', 'BINANCE:ETHUSDT']
    }
  })

  watch(symbols, (newSymbols) => {
    localStorage.setItem('watchlist', JSON.stringify(newSymbols))
  }, { deep: true })

  function addSymbol(symbol) {
    if (symbol && !symbols.value.includes(symbol.toUpperCase())) {
      symbols.value.push(symbol.toUpperCase())
    }
  }

  function removeSymbol(symbol) {
    const index = symbols.value.indexOf(symbol)
    if (index > -1) {
      symbols.value.splice(index, 1)
    }
  }

  return { symbols, addSymbol, removeSymbol }
})
