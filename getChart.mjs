import axios from 'axios'
import sharp from 'sharp'

const createSvg = (data, pair, interval) => {
  const cordinate = data.reduce((acc, itt) => {
    const max = Number(itt.maxPrice)
    const min = Number(itt.minPrice)
    if (!acc.max) {
      acc.max = max
      acc.min = min
    } else {
      acc.max < max ? (acc.max = max) : null
      acc.min > min ? (acc.min = min) : null
    }
    return acc
  }, {})

  const lastKandle = data[data.length - 1]
  const lastPrice = Number(lastKandle.closePrice)
  const lastOpenPrice = Number(lastKandle.openPrice)
  const lastPriceColor = lastPrice > lastOpenPrice ? 'green' : 'red'
  const chartHeight = 200
  const chartWidth = 500
  const lastPriceX2 = 400
  const coef = (cordinate.max - cordinate.min) / (chartHeight - 16)
  const lastPriceY = (cordinate.max - lastPrice) / coef
  const lastPriceX1 = 0
  const svg = `<svg
  width="${chartWidth}"
  height="${chartHeight}"
  viewBox="0 0 ${chartWidth} ${chartHeight}"
  fill="#fff"
  >
  <text x="200" y="10" fill="black">${pair}-${interval}</text>
  ${data.map((el, iter) => {
    const { maxPrice, minPrice, openPrice, closePrice } = el
    const max = Number(maxPrice)
    const min = Number(minPrice)
    const open = Number(openPrice)
    const close = Number(closePrice)
    const kandleColor = open > close ? 'red' : 'green'
    const y1 = (cordinate.max - max) / coef
    const y2 = (cordinate.max - min) / coef
    const y =
      open > close
        ? (cordinate.max - open) / coef
        : (cordinate.max - close) / coef
    const height = Math.abs(open - close) / coef
    return `
    <line x1="${iter * 20 + 10.5}" y1="${y1 + 8}" x2="${
      iter * 20 + 10.5
    }" y2="${y2 + 8}" stroke="${kandleColor}" />
    <rect x="${iter * 20 + 3}" y="${
      y + 8
    }" width="16" height="${height}" fill="${kandleColor}"/>`
  })}
  ${`<line 
  x1="${lastPriceX1}" 
  x2="${lastPriceX2}"
   y1="${lastPriceY + 8}" 
   y2="${lastPriceY + 8}" 
  stroke="${lastPriceColor}"
  stroke-dasharray="3 3" 
  />`}
  ${`
  <text x="410" y="20" fill="green">${cordinate.max}</text>
  <text x="410" y="${
    lastPriceY + 13
  }" fill="${lastPriceColor}">${lastPrice}</text>
  <text x="410" y="190" fill="red">${cordinate.min}</text>
  `}
  </svg>`

  const buf = Buffer.from(svg)
  sharp(buf).png().toFile('new.png')
}

export const fetchChartData = async (pair, interval = '15m') => {
  const rightPair = pair.toUpperCase()
  const req = axios.get(
    `https://api.binance.com/api/v1/klines?symbol=${rightPair}&interval=${interval}&limit=20`,
  )
  const data = await req
  const reducedData = data?.data?.reduce((accum, iter) => {
    accum.push({
      openPrice: iter[1],
      maxPrice: iter[2],
      minPrice: iter[3],
      closePrice: iter[4],
    })
    return accum
  }, [])
  createSvg(reducedData, pair, interval)
}
