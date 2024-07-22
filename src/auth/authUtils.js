'use strict'

const JWT = require('jsonwebtoken')
const asyncHandler = require('../helpers/asyncHandler')
const { AuthFailureError, NotFoundError } = require('../core/error.response')
const { findByUserId } = require('../services/keyToken.service')

const HEADER = {
  API_KEY: 'x-api-key',
  CLIENT_ID: 'x-client-id',
  AUTHORIZATION: 'authorization',
  REFRESHTOKEN: 'x-rtoken-id'
}

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    const accessToken = await JWT.sign(payload, publicKey, {
      expiresIn: '2 days'
    })

    const refreshToken = await JWT.sign(payload, privateKey, {
      expiresIn: '7 days'
    })

    JWT.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.log('Error Decode Token', err)
      } else {
        console.log('Decode Token', decode)
      }
    })

    return { accessToken, refreshToken }
  } catch (error) {}
}

const authentication = asyncHandler(async (req, res, next) => {
  const userId = req.headers[HEADER.CLIENT_ID]
  if (!userId) throw new AuthFailureError('Invalid request')

  const accessToken = req.headers[HEADER.AUTHORIZATION]
  if (!accessToken) throw new AuthFailureError('Invalid request')

  const keyStore = await findByUserId(userId)
  if (!keyStore) throw new NotFoundError('Not found Keystore')

  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
    if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid user')

    req.keyStore = keyStore

    // 6. Ok return next
    return next()
  } catch (error) {
    throw error
  }
})

const authenticationV2 = asyncHandler(async (req, res, next) => {
  const userId = req.headers[HEADER.CLIENT_ID]
  if (!userId) throw new AuthFailureError('Invalid request')

  const keyStore = await findByUserId(userId)
  if (!keyStore) throw new NotFoundError('Not found Keystore')

  if (req.headers[HEADER.REFRESHTOKEN]) {
    try {
      const refreshToken = req.headers[HEADER.REFRESHTOKEN]
      const decodeUser = JWT.verify(refreshToken, keyStore.privateKey)
      if (userId !== decodeUser.userId)
        throw new AuthFailureError('Invalid user')

      req.keyStore = keyStore
      req.user = decodeUser
      req.refreshToken = refreshToken

      // 6. Ok return next
      return next()
    } catch (error) {
      throw error
    }
  }

  const accessToken = req.headers[HEADER.AUTHORIZATION]
  if (!accessToken) throw new AuthFailureError('Invalid request')

  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
    if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid user')

    req.keyStore = keyStore

    // 6. Ok return next
    return next()
  } catch (error) {
    throw error
  }
})

const verifyJWT = async (token, keySecret) => {
  return await JWT.verify(token, keySecret)
}

module.exports = {
  createTokenPair,
  authentication,
  authenticationV2,
  verifyJWT
}
