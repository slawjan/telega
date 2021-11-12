import axios from 'axios'
export const getTokenPrice = async (pair) => {
  try {
    const rightPair = pair.toUpperCase()
    const req = axios.get(
      `https://api.binance.com/api/v3/ticker/price?symbol=${rightPair}`,
    )
    const p = await req
    const { symbol, price } = p.data
    return `Ticker: ${symbol}, Price: ${Number(price).toFixed(2)}`
  } catch (err) {
    return `Something is wrong, maybe this pair ${pair} is incorrect?`
  }
}
