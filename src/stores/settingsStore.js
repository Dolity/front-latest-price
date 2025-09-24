import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    updateInterval: parseInt(import.meta.env.VITE_UPDATE_INTERVAL) || 1000,
    maxWatchlistItems: parseInt(import.meta.env.VITE_MAX_WATCHLIST_ITEMS) || 50,
    appTitle: import.meta.env.VITE_APP_TITLE || 'Latest Price Tracker',
    theme: 'dark',
    notifications: true,
    soundEnabled: false,
    autoRefresh: true,
    displayCurrency: 'USD',
    priceAlerts: [],
  }),

  getters: {
    getUpdateIntervalMs: (state) => state.updateInterval,
    isNotificationsEnabled: (state) => state.notifications,
    getCurrentTheme: (state) => state.theme,
  },

  actions: {
    setUpdateInterval(interval) {
      this.updateInterval = Math.max(500, Math.min(10000, interval)) // 0.5s to 10s
      this.saveToLocalStorage()
    },

    setTheme(theme) {
      this.theme = theme
      this.saveToLocalStorage()
    },

    toggleNotifications() {
      this.notifications = !this.notifications
      this.saveToLocalStorage()
    },

    toggleSound() {
      this.soundEnabled = !this.soundEnabled
      this.saveToLocalStorage()
    },

    toggleAutoRefresh() {
      this.autoRefresh = !this.autoRefresh
      this.saveToLocalStorage()
    },

    setDisplayCurrency(currency) {
      this.displayCurrency = currency
      this.saveToLocalStorage()
    },

    addPriceAlert(alert) {
      this.priceAlerts.push({
        id: Date.now(),
        symbol: alert.symbol,
        targetPrice: alert.targetPrice,
        condition: alert.condition, // 'above' or 'below'
        enabled: true,
        createdAt: new Date().toISOString(),
        ...alert
      })
      this.saveToLocalStorage()
    },

    removePriceAlert(alertId) {
      this.priceAlerts = this.priceAlerts.filter(alert => alert.id !== alertId)
      this.saveToLocalStorage()
    },

    togglePriceAlert(alertId) {
      const alert = this.priceAlerts.find(alert => alert.id === alertId)
      if (alert) {
        alert.enabled = !alert.enabled
        this.saveToLocalStorage()
      }
    },

    loadFromLocalStorage() {
      const saved = localStorage.getItem('app-settings')
      if (saved) {
        try {
          const settings = JSON.parse(saved)
          Object.assign(this, settings)
        } catch (error) {
          console.error('Error loading settings from localStorage:', error)
        }
      }
    },

    saveToLocalStorage() {
      try {
        localStorage.setItem('app-settings', JSON.stringify(this.$state))
      } catch (error) {
        console.error('Error saving settings to localStorage:', error)
      }
    },

    resetToDefaults() {
      this.updateInterval = 1000
      this.maxWatchlistItems = 50
      this.theme = 'dark'
      this.notifications = true
      this.soundEnabled = false
      this.autoRefresh = true
      this.displayCurrency = 'USD'
      this.priceAlerts = []
      this.saveToLocalStorage()
    }
  },
})
