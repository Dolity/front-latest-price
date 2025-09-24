<template>
  <div class="settings-view">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
      <p class="text-gray-600 dark:text-gray-400">Configure your application preferences</p>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- General Settings -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">General</h3>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <div>
              <label class="text-sm font-medium text-gray-900 dark:text-white">Auto Refresh</label>
              <p class="text-xs text-gray-500 dark:text-gray-400">Automatically refresh price data</p>
            </div>
            <button 
              @click="settingsStore.toggleAutoRefresh()"
              class="toggle-btn"
              :class="settingsStore.autoRefresh ? 'bg-blue-500' : 'bg-gray-300'"
            >
              <div class="toggle-dot" :class="settingsStore.autoRefresh ? 'translate-x-4' : 'translate-x-0'"></div>
            </button>
          </div>
          
          <div class="flex justify-between items-center">
            <div>
              <label class="text-sm font-medium text-gray-900 dark:text-white">Notifications</label>
              <p class="text-xs text-gray-500 dark:text-gray-400">Show price alert notifications</p>
            </div>
            <button 
              @click="settingsStore.toggleNotifications()"
              class="toggle-btn"
              :class="settingsStore.notifications ? 'bg-blue-500' : 'bg-gray-300'"
            >
              <div class="toggle-dot" :class="settingsStore.notifications ? 'translate-x-4' : 'translate-x-0'"></div>
            </button>
          </div>
          
          <div class="flex justify-between items-center">
            <div>
              <label class="text-sm font-medium text-gray-900 dark:text-white">Sound Effects</label>
              <p class="text-xs text-gray-500 dark:text-gray-400">Play sounds for alerts</p>
            </div>
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
      
      <!-- Update Settings -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Update Frequency</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Update Interval: {{ settingsStore.updateInterval }}ms
            </label>
            <input 
              type="range" 
              min="500" 
              max="10000" 
              step="500"
              :value="settingsStore.updateInterval"
              @input="settingsStore.setUpdateInterval(parseInt($event.target.value))"
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            >
            <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>0.5s</span>
              <span>10s</span>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">Display Currency</label>
            <select 
              :value="settingsStore.displayCurrency"
              @change="settingsStore.setDisplayCurrency($event.target.value)"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Max Watchlist Items: {{ settingsStore.maxWatchlistItems }}
            </label>
            <input 
              type="range" 
              min="10" 
              max="100" 
              step="10"
              :value="settingsStore.maxWatchlistItems"
              @input="settingsStore.maxWatchlistItems = parseInt($event.target.value)"
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            >
            <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>10</span>
              <span>100</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Theme Settings -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Appearance</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">Theme</label>
            <div class="grid grid-cols-2 gap-3">
              <button 
                @click="setTheme('light')"
                class="p-3 border rounded-lg text-center transition-colors"
                :class="theme === 'light' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' : 'border-gray-300 dark:border-gray-600'"
              >
                <div class="w-8 h-8 bg-white border border-gray-300 rounded mx-auto mb-2"></div>
                <span class="text-sm text-gray-900 dark:text-white">Light</span>
              </button>
              <button 
                @click="setTheme('dark')"
                class="p-3 border rounded-lg text-center transition-colors"
                :class="theme === 'dark' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' : 'border-gray-300 dark:border-gray-600'"
              >
                <div class="w-8 h-8 bg-gray-800 border border-gray-600 rounded mx-auto mb-2"></div>
                <span class="text-sm text-gray-900 dark:text-white">Dark</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Danger Zone -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-red-200 dark:border-red-800">
        <h3 class="text-lg font-bold text-red-600 dark:text-red-400 mb-4">Danger Zone</h3>
        <div class="space-y-4">
          <div>
            <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">Reset Settings</h4>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">
              This will reset all settings to their default values.
            </p>
            <button 
              @click="resetSettings"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Reset to Defaults
            </button>
          </div>
          
          <div>
            <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">Clear All Data</h4>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">
              This will clear all watchlist data and settings.
            </p>
            <button 
              @click="clearAllData"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Clear All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme'
import { useSettingsStore } from '@/stores/settingsStore'
import { useWatchlistStore } from '@/stores/watchlistStore'

const { theme, toggleTheme } = useTheme()
const settingsStore = useSettingsStore()
const watchlistStore = useWatchlistStore()

const setTheme = (newTheme) => {
  if (newTheme !== theme.value) {
    toggleTheme()
  }
}

const resetSettings = () => {
  if (confirm('Are you sure you want to reset all settings to defaults?')) {
    settingsStore.resetToDefaults()
  }
}

const clearAllData = () => {
  if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
    settingsStore.resetToDefaults()
    localStorage.removeItem('watchlist')
    localStorage.removeItem('app-settings')
    localStorage.removeItem('theme')
    location.reload()
  }
}
</script>

<style scoped>
.toggle-btn {
  @apply relative inline-flex h-6 w-11 items-center rounded-full transition-colors;
}

.toggle-dot {
  @apply inline-block h-4 w-4 transform rounded-full bg-white transition-transform;
}

input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
}
</style>
