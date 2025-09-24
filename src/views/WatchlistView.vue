<template>
  <div class="watchlist-view">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Watchlist</h1>
      <p class="text-gray-600 dark:text-gray-400">Manage your tracked symbols and view real-time prices</p>
    </div>
    
    <Watchlist />
  </div>
</template>

<script setup>
import Watchlist from '@/components/Watchlist.vue'
</script>
