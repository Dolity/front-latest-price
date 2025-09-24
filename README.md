# Latest Price - Real-time Stock & Crypto Price Tracker

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=flat&logo=vue.js&logoColor=white)](https://vuejs.org/)

A modern Vue.js frontend application for tracking real-time stock and cryptocurrency prices with ultra-fast updates and beautiful visualizations.

## 🚀 Features

### Real-time Price Tracking
- **Ultra-fast Updates**: Sub-second price updates using WebSocket connections
- **Stock Market Data**: Real-time prices from NYSE, NASDAQ, and global exchanges
- **Cryptocurrency Monitoring**: Live crypto prices from top exchanges
- **Multi-asset Dashboard**: Track multiple assets simultaneously
- **Price Alerts**: Custom notifications for price movements

### Modern UI/UX
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Interactive Charts**: Real-time candlestick and line charts
- **Dark/Light Theme**: Toggle between themes
- **Custom Watchlists**: Personalized asset tracking
- **Search & Filter**: Quick asset discovery

### Performance Optimized
- **WebSocket Integration**: Direct exchange connections for minimal latency
- **Efficient State Management**: Pinia for reactive data flow
- **Lazy Loading**: Optimized component loading
- **Caching Strategy**: Smart data caching for better performance

## 🛠️ Technology Stack

- **Frontend Framework**: Vue.js 3 (Composition API)
- **State Management**: Pinia
- **Build Tool**: Vite
- **Package Manager**: Bun
- **Styling**: Tailwind CSS / SCSS
- **Charts**: Chart.js / TradingView Widgets
- **HTTP Client**: Axios
- **WebSocket**: Native WebSocket API
- **UI Components**: Headless UI / Vuetify

## 📊 Data Providers

### Stock Market Data
- **Finnhub**: Real-time stock prices (Primary)
- **Alpha Vantage**: Market data and fundamentals
- **IEX Cloud**: High-frequency trading data
- **Polygon.io**: Professional-grade market data

### Cryptocurrency Data
- **Binance WebSocket**: Ultra-fast crypto updates
- **CoinGecko API**: Comprehensive crypto data
- **CryptoCompare**: Multi-exchange aggregation
- **Coinbase Pro**: Direct exchange feeds

## 📋 Prerequisites

- Bun 1.0+ (includes Node.js runtime)
- Modern web browser with WebSocket support

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/latest-price.git
cd latest-price
```

### 2. Install Dependencies
```bash
bun install
```

### 3. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your API keys
nano .env
```

### 4. Start Development Server
```bash
bun run dev
```

Visit `http://localhost:5173` to view the application.

> **Why Bun?** Bun is significantly faster than npm/yarn for package installation and script execution, making development more efficient.

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# API Keys
VITE_FINNHUB_API_KEY=your_finnhub_api_key
VITE_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
VITE_COINGECKO_API_KEY=your_coingecko_key
VITE_POLYGON_API_KEY=your_polygon_key

# WebSocket URLs
VITE_BINANCE_WS_URL=wss://stream.binance.com:9443/ws
VITE_FINNHUB_WS_URL=wss://ws.finnhub.io

# App Configuration
VITE_APP_TITLE=Latest Price Tracker
VITE_UPDATE_INTERVAL=1000
VITE_MAX_WATCHLIST_ITEMS=50
```

## 📖 Project Structure

```
src/
├── components/          # Reusable Vue components
│   ├── charts/         # Chart components
│   ├── common/         # Common UI components
│   └── widgets/        # Price widgets
├── composables/        # Vue composition functions
├── stores/             # Pinia stores
│   ├── priceStore.js   # Price data management
│   ├── watchlistStore.js # Watchlist management
│   └── settingsStore.js # App settings
├── services/           # API and WebSocket services
│   ├── api/           # REST API calls
│   └── websocket/     # WebSocket connections
├── utils/             # Utility functions
├── views/             # Page components
└── router/            # Vue Router configuration
```

## 🔌 WebSocket Integration

### Real-time Price Updates
```javascript
// stores/priceStore.js
import { defineStore } from 'pinia'

export const usePriceStore = defineStore('price', {
  state: () => ({
    prices: {},
    connections: new Map()
  }),
  
  actions: {
    connectToFinnhub(symbols) {
      const ws = new WebSocket(`${import.meta.env.VITE_FINNHUB_WS_URL}?token=${import.meta.env.VITE_FINNHUB_API_KEY}`)
      
      ws.onopen = () => {
        symbols.forEach(symbol => {
          ws.send(JSON.stringify({type: 'subscribe', symbol}))
        })
      }
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        this.updatePrice(data)
      }
    }
  }
})
```

### Crypto WebSocket Connection
```javascript
// services/websocket/binanceService.js
export class BinanceWebSocket {
  constructor() {
    this.ws = null
    this.subscriptions = new Set()
  }
  
  connect() {
    this.ws = new WebSocket(import.meta.env.VITE_BINANCE_WS_URL)
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      // Handle real-time crypto price updates
      this.handlePriceUpdate(data)
    }
  }
  
  subscribe(symbol) {
    const stream = `${symbol.toLowerCase()}@ticker`
    this.ws.send(JSON.stringify({
      method: 'SUBSCRIBE',
      params: [stream],
      id: Date.now()
    }))
  }
}
```

## 📱 Components Usage

### Price Widget Component
```vue
<template>
  <div class="price-widget">
    <div class="symbol">{{ symbol }}</div>
    <div class="price" :class="priceClass">
      ${{ formatPrice(currentPrice) }}
    </div>
    <div class="change">
      {{ formatChange(priceChange) }}%
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePriceStore } from '@/stores/priceStore'

const props = defineProps(['symbol'])
const priceStore = usePriceStore()

const currentPrice = computed(() => priceStore.getPrice(props.symbol))
const priceChange = computed(() => priceStore.getChange(props.symbol))
const priceClass = computed(() => priceChange.value >= 0 ? 'positive' : 'negative')
</script>
```

### Watchlist Management
```vue
<template>
  <div class="watchlist">
    <div class="header">
      <h2>My Watchlist</h2>
      <button @click="addSymbol">Add Symbol</button>
    </div>
    <div class="symbols">
      <PriceWidget 
        v-for="symbol in watchlist" 
        :key="symbol" 
        :symbol="symbol"
        @remove="removeSymbol"
      />
    </div>
  </div>
</template>

<script setup>
import { useWatchlistStore } from '@/stores/watchlistStore'
import PriceWidget from '@/components/widgets/PriceWidget.vue'

const watchlistStore = useWatchlistStore()
const watchlist = computed(() => watchlistStore.symbols)
</script>
```

## 🧪 Testing

```bash
# Run unit tests
bun run test:unit

# Run component tests
bun run test:component

# Run e2e tests
bun run test:e2e

# Run all tests
bun test
```

## 🏗️ Build & Deployment

```bash
# Build for production
bun run build

# Preview production build
bun run preview

# Deploy to Netlify
bun run deploy:netlify

# Deploy to Vercel
bun run deploy:vercel
```

## 📊 Performance Features

- **Real-time Updates**: < 100ms latency for price updates
- **Efficient Rendering**: Virtual scrolling for large watchlists
- **Memory Management**: Automatic cleanup of unused connections
- **Offline Support**: Service worker for offline functionality
- **Progressive Loading**: Lazy load components and data

## 🎨 Customization

### Theme Configuration
```javascript
// src/composables/useTheme.js
export function useTheme() {
  const theme = ref('dark')
  
  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', theme.value)
  }
  
  return { theme, toggleTheme }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Finnhub](https://finnhub.io/) for real-time stock market data
- [Binance](https://binance.com/) for cryptocurrency WebSocket feeds
- [CoinGecko](https://coingecko.com/) for comprehensive crypto data
- [Vue.js](https://vuejs.org/) and [Pinia](https://pinia.vuejs.org/) teams

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/latest-price/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/latest-price/discussions)

---

**⭐ Star this repository if you find it helpful!**

Built with ❤️ using Vue.js + Pinia
