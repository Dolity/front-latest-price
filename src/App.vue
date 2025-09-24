<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { useSettingsStore } from '@/stores/settingsStore'
import AppHeader from '@/components/common/AppHeader.vue'

const { theme } = useTheme()
const settingsStore = useSettingsStore()

onMounted(() => {
  // Load settings from localStorage
  settingsStore.loadFromLocalStorage()
  
  // Apply theme
  if (theme.value === 'dark') {
    document.documentElement.classList.add('dark')
  }
})
</script>

<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <!-- App Header -->
    <AppHeader />

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-6">
      <RouterView />
    </main>

    <!-- Footer -->
    <footer class="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-6 mt-12">
      <div class="container mx-auto px-4">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div class="text-gray-600 dark:text-gray-400 text-sm">
            © 2024 Latest Price Tracker. Built with Vue.js + Pinia
          </div>
          <div class="flex space-x-4 mt-4 md:mt-0">
            <a href="#" class="text-gray-600 dark:text-gray-400 hover:text-blue-500 text-sm">Documentation</a>
            <a href="#" class="text-gray-600 dark:text-gray-400 hover:text-blue-500 text-sm">API</a>
            <a href="#" class="text-gray-600 dark:text-gray-400 hover:text-blue-500 text-sm">Support</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* App-level styles */
#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
