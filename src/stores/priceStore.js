import { defineStore } from 'pinia'

export const usePriceStore = defineStore('price', {
  state: () => ({
    prices: {}, // e.g. { 'BINANCE:BTCUSDT': { p: 70000, t: 1625140800000, c: ['trade'], v: 0.001 } }
    connections: new Map()
  }),

  getters: {
    getPrice: (state) => (symbol) => {
      return state.prices[symbol]?.p || 0;
    },
    getChange: (state) => (symbol) => {
      // This is a simplified version. A real implementation would need historical data.
      // For now, let's just return a random change for demonstration.
      const priceData = state.prices[symbol];
      if (!priceData || !priceData.p) return 0;
      return (Math.random() - 0.5) * 2;
    }
  },

  actions: {
    updatePrice(data) {
      if (data.type === 'trade' && data.data) {
        data.data.forEach(trade => {
          this.prices[trade.s] = {
            p: trade.p,
            t: trade.t,
            v: trade.v,
            c: trade.c,
          };
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
        symbols.forEach(symbol => {
          ws.send(JSON.stringify({type: 'subscribe', symbol}))
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
        this.connections.delete('finnhub');
      }

      ws.onerror = (error) => {
        console.error('Finnhub WebSocket error:', error);
      }
    }
  }
})
