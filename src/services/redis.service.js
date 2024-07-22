'use strict'

const redis = require('redis')
const { promisify } = require('util')
const { reservationInventory } = require('../models/repository/inventory.repo')

const redisClient = redis.createClient()
const pexpire = promisify(redisClient.pExpire).bind(redisClient)
const setnxAsync = promisify(redisClient.setNX).bind(redisClient)
redisClient.on('error', (err) => console.log('Redis Client Error', err))

const acquireLock = async (productId, quantity, cartId) => {
  await redisClient.connect()
  const key = `lock_v1_${productId}`
  const retryTimes = 10
  const expireTime = 3000

  for (let i = 0; i < retryTimes; i++) {
    const result = await setnxAsync(key, expireTime)
    console.log(result)
    if (result === 1) {
      // thao tac voi inventory
      // const isReversation = await reservationInventory({
      //   productId,
      //   quantity,
      //   cartId
      // })
      // console.log('isReversation', isReversation)
      // if (isReversation.modifiedCount) {
      //   await pexpire(key, expireTime)
      //   return key
      // }
      return null
    } else {
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  }
}

const releaseLock = async (keylock) => {
  const delAsyncKey = promisify(redisClient.del).bind(redisClient)
  return await delAsyncKey(keylock)
}

module.exports = {
  acquireLock,
  releaseLock
}
