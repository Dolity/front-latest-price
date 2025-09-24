import axios from 'axios'

class CoinGeckoAPI {
  constructor() {
    this.baseURL = 'https://api.coingecko.com/api/v3'
    this.apiKey = import.meta.env.VITE_COINGECKO_API_KEY
  }

  async getCryptoPrices(ids = ['bitcoin', 'ethereum', 'binancecoin']) {
    try {
      const params = {
        ids: ids.join(','),
        vs_currencies: 'usd',
        include_24hr_change: true,
        include_market_cap: true,
        include_24hr_vol: true
      }

      if (this.apiKey) {
        params.x_cg_demo_api_key = this.apiKey
      }

      const response = await axios.get(`${this.baseURL}/simple/price`, {
        params
      })
      return response.data
    } catch (error) {
      console.error('Error fetching crypto prices from CoinGecko:', error)
      return {}
    }
  }

  async searchCoins(query) {
    try {
      const params = { query }
      if (this.apiKey) {
        params.x_cg_demo_api_key = this.apiKey
      }

      const response = await axios.get(`${this.baseURL}/search`, {
        params
      })
      return response.data.coins || []
    } catch (error) {
      console.error('Error searching coins from CoinGecko:', error)
      return []
    }
  }

  async getCoinDetails(id) {
    try {
      const params = {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
        sparkline: false
      }

      if (this.apiKey) {
        params.x_cg_demo_api_key = this.apiKey
      }

      const response = await axios.get(`${this.baseURL}/coins/${id}`, {
        params
      })
      return response.data
    } catch (error) {
      console.error('Error fetching coin details from CoinGecko:', error)
      return null
    }
  }

  async getTrendingCoins() {
    try {
      const params = {}
      if (this.apiKey) {
        params.x_cg_demo_api_key = this.apiKey
      }

      const response = await axios.get(`${this.baseURL}/search/trending`, {
        params
      })
      return response.data.coins || []
    } catch (error) {
      console.error('Error fetching trending coins from CoinGecko:', error)
      return []
    }
  }
}

export const coingeckoApi = new CoinGeckoAPI()
