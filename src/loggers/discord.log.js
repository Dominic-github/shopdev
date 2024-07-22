'use strict'

const { Client, GatewayIntentBits } = require('discord.js')

const { CHANNEL_DISCORD_ID, TOKEN_DISCORD } = process.env

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
})

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

const token = TOKEN_DISCORD

client.login(token)

client.on('messageCreate', (msg) => {
  if (msg.author.bot) return
  if (msg.content === 'hello') {
    msg.reply('hello cai gi!')
  }
  if (msg.content === 'Bao nhiêu lâu thì bán được 1 tỷ gói mè! Trả lời') {
    msg.reply('Em bán kem đánh răng!')
  }
})
