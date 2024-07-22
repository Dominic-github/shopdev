'use strict'
const { Client, GatewayIntentBits } = require('discord.js')
const { CHANNEL_DISCORD_ID, TOKEN_DISCORD } = process.env
class LoggerService {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ]
    })
    // add channel id
    this.channelId = CHANNEL_DISCORD_ID
    this.client.on('ready', () => {
      console.log(`Logged in as ${this.client.user.tag}!`)
    })
    this.client.login(TOKEN_DISCORD)
  }

  sendToFormatCode(logData) {
    const {
      code,
      message = 'this is some additional information about the code',
      title = 'code example'
    } = logData

    const codeMessage = {
      content: message,
      embeds: [
        {
          color: parseInt('00ff00', 16),
          title,
          description: '```json\n' + JSON.stringify(code, null, 2) + '\n```'
        }
      ]
    }
    this.sendToMessage(codeMessage)
  }
  sendToMessage(message = 'message') {
    const channel = this.client.channels.cache.get(this.channelId)
    if (!channel) {
      console.log('Channel not found channelId: ' + this.channelId)
      return
    }
    channel.send(message).catch((e) => console.log(e))
  }
}

// const loggerService = new LoggerService()

module.exports = new LoggerService()
