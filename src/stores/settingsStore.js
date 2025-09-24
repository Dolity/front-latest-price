import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    updateInterval: 1000,
    maxWatchlistItems: 50,
  }),

  actions: {
    setUpdateInterval(interval) {
      this.updateInterval = interval
    },
  },
})
