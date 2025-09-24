import axios from 'axios'

class FinnhubAPI {
  constructor() {
    this.baseURL = 'https://finnhub.io/api/v1'
    this.apiKey = import.meta.env.VITE_FINNHUB_API_KEY
  }

  async getQuote(symbol) {
    if (!this.apiKey) {
      console.warn('Finnhub API key not configured')
      return null
    }

    try {
      const response = await axios.get(`${this.baseURL}/quote`, {
        params: {
          symbol: symbol,
          token: this.apiKey
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching quote from Finnhub:', error)
      return null
    }
  }

  async getCompanyProfile(symbol) {
    if (!this.apiKey) {
      console.warn('Finnhub API key not configured')
      return null
    }

    try {
      const response = await axios.get(`${this.baseURL}/stock/profile2`, {
        params: {
          symbol: symbol,
          token: this.apiKey
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching company profile from Finnhub:', error)
      return null
    }
  }

  async searchSymbols(query) {
    if (!this.apiKey) {
      console.warn('Finnhub API key not configured')
      return []
    }

    try {
      const response = await axios.get(`${this.baseURL}/search`, {
        params: {
          q: query,
          token: this.apiKey
        }
      })
      return response.data.result || []
    } catch (error) {
      console.error('Error searching symbols from Finnhub:', error)
      return []
    }
  }
}

export const finnhubApi = new FinnhubAPI()
