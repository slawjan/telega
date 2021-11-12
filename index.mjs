import TelegramBot from 'node-telegram-bot-api'
import { getTokenPrice } from './getBitcoinPrice.mjs'
import dotenv from 'dotenv'
import { fetchChartData } from './getChart.mjs'
import { periods } from './data.mjs'
import { getPeriodKeys } from './utils.mjs'
import { setLightState } from './setLightningState.mjs'

const env = dotenv.config()

const token = process.env.TELEGRAM_TOKEN

const bot = new TelegramBot(token, { polling: true })

const cryptoState = {
  period: '5m',
}

bot.onText(/\/price (.+)/, async (msg, match) => {
  const chatId = msg.chat.id
  const pair = match[1]
  const data = await getTokenPrice(pair)
  bot.sendMessage(chatId, data)
})

const chartKeyboard = () => ({
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: 'ethusdt',
          callback_data: `/chart ethusdt ${cryptoState.period}`,
        },
        {
          text: 'btcusdt',
          callback_data: `/chart btcusdt ${cryptoState.period}`,
        },
        {
          text: 'thetausdt',
          callback_data: `/chart thetausdt ${cryptoState.period}`,
        },
      ],
      getPeriodKeys(cryptoState.period, periods),

      [{ text: 'back', callback_data: 'crypto menu' }],
    ],
    resize_keyboard: true,
  },
})

bot.onText(/\/light/, (msg)=>{
	const {
    chat: { id },
  } = msg
	bot.sendMessage(id, "what we do with the lightning??", {
		reply_markup: {
			inline_keyboard: [
				[
					{text: 'turn on', callback_data: '/light on'},
					{text: 'turn off', callback_data: '/light off'},
				]
			]
		}
	})
})

bot.onText(/\/test/, (msg) => {
  const {
    chat: { id },
  } = msg
  bot.sendMessage(id, 'Select type', {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'crypto', callback_data: 'crypto' },
          { text: 'chart', callback_data: 'chart' },
        ],
      ],
    },
  })
})

bot.on('callback_query', async (msg) => {
  const {
    message: {
      chat: { id },
    },
    data,
    message: { message_id: mess_id },
  } = msg

  if (data === 'crypto menu') {
    bot.sendMessage(id, 'Select type', {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'crypto', callback_data: 'crypto' },
            { text: 'chart', callback_data: 'chart' },
          ],
        ],
      },
    })
  }

  if (data === 'crypto') {
    bot.sendMessage(id, 'Select pair', {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'ethusdt',
              callback_data: `/pair ethusdt`,
            },
            {
              text: 'btcusdt',
              callback_data: `/pair btcusdt`,
            },
          ],
          [{ text: '^ back', callback_data: 'crypto menu' }],
        ],
      },
    })
  }
  if (data === 'chart') {
    bot.sendMessage(id, 'Select chart', chartKeyboard())
  }

  const chart = data.match(/\/chart (.+)/)
  if (chart) {
    const c = chart[1]
    const z = c.match(/(\w+) ([A-Za-z0-9]+)/)

    await fetchChartData(z[1], z[2])
    setTimeout(() => {
      bot.sendPhoto(id, 'new.png')
    }, 500)
  }

	const light = data.match(/\/light (.+)/)
	if(light){
		const state = light[1]
		setLightState(state)
	}


  const pair = data.match(/\/pair (.+)/)
  if (pair) {
    const p = pair[1]

    const d = await getTokenPrice(p)
    bot.sendMessage(id, d)
  }
  const period = data.match(/\/period (\w+)/)
  if (period) {
    const p = period[1]
    if (p === 'right') {
      cryptoState.period = periods[periods.indexOf(cryptoState.period) + 1]
    } else if (p === 'left') {
      cryptoState.period = periods[periods.indexOf(cryptoState.period) - 1]
    } else {
      cryptoState.period = periods[periods.indexOf(p)]
    }

    bot.deleteMessage(id, mess_id)
    bot.sendMessage(id, 'Select chart', { ...chartKeyboard() })
  }
})
