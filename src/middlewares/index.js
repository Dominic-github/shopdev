'use strict'

const Logger = require('../loggers/discord.log.v2')

const pustToLogDiscord = async (req, res, next) => {
  try {
    Logger.sendToFormatCode({
      title: `Method: ${req.method}`,
      code: req.method === 'GET' ? req.query : req.body,
      message: `${req.get('host')}:${req.originalUrl}`
    })

    return next()
  } catch (error) {
    console.error(error)
  }
}

module.exports = {
  pustToLogDiscord
}
