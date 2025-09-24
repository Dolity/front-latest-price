import { defineStore } from 'pinia'
import { BinanceWebSocket } from '@/services/websocket/binanceService'

export const usePriceStore = defineStore('price', {
  state: () => ({
    prices: {}, // e.g. { 'BINANCE:BTCUSDT': { p: 70000, t: 1625140800000, c: ['trade'], v: 0.001, change24h: 2.5 } }
    connections: new Map(),
    priceHistory: {}, // Store price history for change calculations
    lastPrices: {}, // Store previous prices for change calculation
    isConnected: false,
    connectionStatus: {
      finnhub: false,
      binance: false
    }
  }),

  getters: {
    getPrice: (state) => (symbol) => {
      return state.prices[symbol]?.p || 0;
    },
    
    getChange: (state) => (symbol) => {
      const current = state.prices[symbol];
      const previous = state.lastPrices[symbol];
      
      if (!current || !previous || !current.p || !previous.p) {
        return current?.change24h || 0;
      }
      
      return ((current.p - previous.p) / previous.p) * 100;
    },

    getVolume: (state) => (symbol) => {
      return state.prices[symbol]?.v || 0;
    },

    getLastUpdate: (state) => (symbol) => {
      return state.prices[symbol]?.t || 0;
    },

    getAllPrices: (state) => state.prices,

    isSymbolConnected: (state) => (symbol) => {
      if (symbol.startsWith('BINANCE:')) {
        return state.connectionStatus.binance;
      }
      return state.connectionStatus.finnhub;
    }
  },

  actions: {
    updatePrice(data) {
      if (data.type === 'trade' && data.data) {
        data.data.forEach(trade => {
          // Store previous price for change calculation
          if (this.prices[trade.s]) {
            this.lastPrices[trade.s] = { ...this.prices[trade.s] };
          }

          this.prices[trade.s] = {
            p: parseFloat(trade.p),
            t: trade.t,
            v: parseFloat(trade.v) || 0,
            c: trade.c || [],
            change24h: trade.change24h || 0,
            lastUpdate: Date.now()
          };

          // Store price history (keep last 100 prices)
          if (!this.priceHistory[trade.s]) {
            this.priceHistory[trade.s] = [];
          }
          this.priceHistory[trade.s].push({
            price: parseFloat(trade.p),
            timestamp: trade.t || Date.now()
          });
          
          // Keep only last 100 entries
          if (this.priceHistory[trade.s].length > 100) {
            this.priceHistory[trade.s] = this.priceHistory[trade.s].slice(-100);
          }
        });
      }
    },

    connectToFinnhub(symbols) {
      // Do not connect if API key is not set
      if (!import.meta.env.VITE_FINNHUB_API_KEY) {
        console.warn('Finnhub API key is not set. Skipping connection.');
        return;
      }

      const ws = new WebSocket(`${import.meta.env.VITE_FINNHUB_WS_URL}?token=${import.meta.env.VITE_FINNHUB_API_KEY}`)

      ws.onopen = () => {
        console.log('Connected to Finnhub WebSocket');
        this.connectionStatus.finnhub = true;
        symbols.forEach(symbol => {
          if (!symbol.startsWith('BINANCE:')) {
            ws.send(JSON.stringify({type: 'subscribe', symbol}))
          }
        })
        this.connections.set('finnhub', ws);
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === 'ping') {
          ws.send(JSON.stringify({type: 'pong'}));
        } else {
          this.updatePrice(data)
        }
      }

      ws.onclose = () => {
        console.log('Disconnected from Finnhub WebSocket');
        this.connectionStatus.finnhub = false;
        this.connections.delete('finnhub');
      }

      ws.onerror = (error) => {
        console.error('Finnhub WebSocket error:', error);
        this.connectionStatus.finnhub = false;
      }
    },

    connectToBinance(symbols) {
      const binanceSymbols = symbols.filter(symbol => symbol.startsWith('BINANCE:'));
      
      if (binanceSymbols.length === 0) {
        return;
      }

      const binanceWS = new BinanceWebSocket((data) => {
        this.updatePrice(data);
      });

      binanceWS.connect();
      
      // Subscribe to symbols after connection
      setTimeout(() => {
        binanceSymbols.forEach(symbol => {
          binanceWS.subscribe(symbol);
        });
        this.connectionStatus.binance = true;
      }, 1000);

      this.connections.set('binance', binanceWS);
    },

    connectToAll(symbols) {
      this.connectToFinnhub(symbols);
      this.connectToBinance(symbols);
    },

    disconnectAll() {
      this.connections.forEach((connection, key) => {
        if (connection && typeof connection.close === 'function') {
          connection.close();
        } else if (connection && connection.ws && typeof connection.ws.close === 'function') {
          connection.ws.close();
        }
      });
      this.connections.clear();
      this.connectionStatus.finnhub = false;
      this.connectionStatus.binance = false;
    },

    subscribeToSymbol(symbol) {
      if (symbol.startsWith('BINANCE:')) {
        const binanceWS = this.connections.get('binance');
        if (binanceWS) {
          binanceWS.subscribe(symbol);
        }
      } else {
        const finnhubWS = this.connections.get('finnhub');
        if (finnhubWS && finnhubWS.readyState === WebSocket.OPEN) {
          finnhubWS.send(JSON.stringify({type: 'subscribe', symbol}));
        }
      }
    },

    unsubscribeFromSymbol(symbol) {
      if (symbol.startsWith('BINANCE:')) {
        const binanceWS = this.connections.get('binance');
        if (binanceWS) {
          binanceWS.unsubscribe(symbol);
        }
      } else {
        const finnhubWS = this.connections.get('finnhub');
        if (finnhubWS && finnhubWS.readyState === WebSocket.OPEN) {
          finnhubWS.send(JSON.stringify({type: 'unsubscribe', symbol}));
        }
      }
    },

    getPriceHistory(symbol, limit = 50) {
      return this.priceHistory[symbol]?.slice(-limit) || [];
    },

    clearPriceHistory(symbol) {
      if (symbol) {
        delete this.priceHistory[symbol];
      } else {
        this.priceHistory = {};
      }
    }
  }
})
