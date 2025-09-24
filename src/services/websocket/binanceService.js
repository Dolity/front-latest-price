// services/websocket/binanceService.js
export class BinanceWebSocket {
  constructor(onPriceUpdate) {
    this.ws = null
    this.subscriptions = new Set()
    this.onPriceUpdate = onPriceUpdate
  }

  connect() {
    this.ws = new WebSocket(import.meta.env.VITE_BINANCE_WS_URL)

    this.ws.onopen = () => {
        console.log('Connected to Binance WebSocket');
        // Resubscribe to any existing subscriptions
        this.subscriptions.forEach(symbol => this.subscribe(symbol));
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      this.handlePriceUpdate(data)
    }

    this.ws.onclose = () => {
        console.log('Disconnected from Binance WebSocket');
    }

    this.ws.onerror = (error) => {
        console.error('Binance WebSocket error:', error);
    }
  }

  handlePriceUpdate(data) {
    if (data && data.s && data.c) {
        const trade = {
            s: `BINANCE:${data.s.replace('USDT', '-USD')}`, // Standardize symbol format
            p: parseFloat(data.c),
            t: data.E,
            v: parseFloat(data.v),
            c: [] // Binance ticker doesn't provide condition codes
        };
        // The price store expects a specific format
        const priceStoreData = { type: 'trade', data: [trade] };
        if (this.onPriceUpdate) {
            this.onPriceUpdate(priceStoreData);
        }
    }
  }

  subscribe(symbol) {
    // Binance symbols are like 'BTCUSDT'
    const binanceSymbol = symbol.replace('BINANCE:', '').replace('-USD', 'USDT');
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        const stream = `${binanceSymbol.toLowerCase()}@ticker`
        this.ws.send(JSON.stringify({
          method: 'SUBSCRIBE',
          params: [stream],
          id: Date.now()
        }))
        this.subscriptions.add(symbol);
    } else {
        // If not connected, add to subscriptions and it will be picked up on connect
        this.subscriptions.add(symbol);
        if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
            this.connect();
        }
    }
  }

  unsubscribe(symbol) {
    const binanceSymbol = symbol.replace('BINANCE:', '').replace('-USD', 'USDT');
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        const stream = `${binanceSymbol.toLowerCase()}@ticker`
        this.ws.send(JSON.stringify({
          method: 'UNSUBSCRIBE',
          params: [stream],
          id: Date.now()
        }))
    }
    this.subscriptions.delete(symbol);
  }
}
