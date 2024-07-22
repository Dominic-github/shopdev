'use strict'

const mongoose = require('mongoose')
require('dotenv').config()
const { countConnect } = require('../helpers/check.connect')
const {
  db: { host, name, port }
} = require('../configs/config.mongodb')

const connectString =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/shopDev'

class Database {
  constructor() {
    this.connect()
  }

  connect(type = 'mongodb') {
    if (true) {
      mongoose.set('debug', true)
      mongoose.set('debug', { color: true })
    }
    mongoose.connect(connectString).then((_) => {
      console.log('Connected Mongodb Success ')
      countConnect()
    })
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database()
    }
    return this.instance
  }
}

const instanceDatabase = Database.getInstance()
module.exports = instanceDatabase
