'use strict'

require('dotenv').config()

const dev = {
  app: {
    port: process.env.PORT || 3050
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 27017,
    name: process.env.DB_NAME || 'shopDev'
  }
}

const prod = {
  app: {
    port: process.env.PORT || 3050
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 27017,
    name: process.env.DB_NAME || 'shopDev'
  }
}

const config = { dev, prod }
const env = process.env.NODE_ENV || 'dev'
module.exports = config[env]
