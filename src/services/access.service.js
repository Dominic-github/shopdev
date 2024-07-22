'use strict'

const bcrypt = require('bcrypt')
const shopModel = require('../models/shop.model')
const crypto = require('node:crypto')
const KeyTokenService = require('./keyToken.service')
const { createTokenPair, verifyJWT } = require('../auth/authUtils')
const { getInfoData } = require('../utils')
const {
  BadRequestError,
  ConflictRequestError,
  AuthFailureError,
  ForbiddenError
} = require('../core/error.response')
const { findByEmail } = require('./shop.service')

const RoleShop = {
  SHOP: 'SHOP',
  WRITER: 'WRITER',
  EDITOR: 'EDITOR',
  ADMIN: 'ADMIN'
}

class AccessService {
  // v2
  static handlerRefreshTokenV2 = async ({ refreshToken, user, keyStore }) => {
    const { userId, email } = user

    if (keyStore.refreshTokensUsed.includes(refreshToken)) {
      await KeyTokenService.deleteKeyById(userId)
      throw new ForbiddenError('Something went wrong!!! Pls relogin')
    }

    if (keyStore.refreshToken !== refreshToken) {
      throw new AuthFailureError('Shop not registered!')
    }

    const foundShop = await findByEmail({ email })
    if (!foundShop) throw new AuthFailureError('Shop not found')

    // create access token
    const tokens = await createTokenPair(
      { userId, email },
      keyStore.publicKey,
      keyStore.privateKey
    )

    // update access token

    await keyStore.updateOne({
      $set: {
        refreshToken: tokens.refreshToken
      },
      $addToSet: {
        refreshTokensUsed: refreshToken
      }
    })

    return {
      user,
      tokens
    }
  }

  // v1
  static handlerRefreshToken = async (refreshToken) => {
    // check token used
    const foundToken = await KeyTokenService.findByRefreshTokenUsed(
      refreshToken
    )
    if (foundToken) {
      // decode

      const { userId, email } = await verifyJWT(
        refreshToken,
        foundToken.privateKey
      )

      // delete all tokens
      await KeyTokenService.deleteKeyById(userId)
      throw new ForbiddenError('Something went wrong!!! Pls relogin')
    }

    const holderToken = await KeyTokenService.findByRefreshToken(refreshToken)
    if (!holderToken) throw new AuthFailureError('Shop not registered')

    const { userId, email } = await verifyJWT(
      refreshToken,
      holderToken.privateKey
    )

    const foundShop = await findByEmail({ email })

    if (!foundShop) throw new AuthFailureError('Shop not found')

    // create access token
    const tokens = await createTokenPair(
      { userId, email },
      holderToken.publicKey,
      holderToken.privateKey
    )

    // update access token

    await holderToken.updateOne({
      $set: {
        refreshToken: tokens.refreshToken
      },
      $addToSet: {
        refreshTokensUsed: refreshToken
      }
    })

    return {
      user: { userId, email },
      tokens
    }
  }

  static logout = async (keyStore) => {
    const delKey = await KeyTokenService.removeKeyById(keyStore._id)
    return delKey
  }

  // 1 - check email in dbs
  // 2 - match password
  // 3 - create AT vs RT and save
  // 4 - generate Token
  // 5 - get data and return login

  static login = async ({ email, password, refreshToken = null }) => {
    try {
      const foundShop = await shopModel.findOne({ email })
      if (!foundShop) throw new BadRequestError('Shop not registered')

      const isMatch = await bcrypt.compare(password, foundShop.password)
      if (!isMatch) throw new AuthFailureError('Authentication failed')

      const privateKey = crypto.randomBytes(64).toString('hex')
      const publicKey = crypto.randomBytes(64).toString('hex')

      const tokens = await createTokenPair(
        { userId: foundShop._id, email },
        publicKey,
        privateKey
      )

      await KeyTokenService.createKeyToken({
        userId: foundShop._id,
        refreshToken: tokens.refreshToken,
        privateKey,
        publicKey
      })
      return {
        shop: getInfoData({
          fileds: ['_id', 'name', 'email'],
          object: foundShop
        }),
        tokens
      }
    } catch (err) {
      console.log('Error: ' + err.message)
    }
  }

  static signUp = async ({ name, email, password }) => {
    try {
      // // check email
      const holderShop = await shopModel.findOne({ email }).lean()
      if (holderShop) {
        throw new BadRequestError('Error: Shop already registered!')
      }

      const passwordHash = await bcrypt.hash(password, 10)
      const newShop = await shopModel.create({
        name,
        email,
        password: passwordHash,
        roles: [RoleShop.SHOP]
      })

      if (newShop) {
        // // Create privateKey, publicKey
        // const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        //   modulusLength: 4096,
        //   publicKeyEncoding: {
        //     type: 'pkcs1',
        //     format: 'pem'
        //   },
        //   privateKeyEncoding: {
        //     type: 'pkcs1',
        //     format: 'pem'
        //   }
        // })
        // console.log({ privateKey, publicKey }) // save to collection keystore

        const privateKey = crypto.randomBytes(64).toString('hex')
        const publicKey = crypto.randomBytes(64).toString('hex')

        const keyStore = await KeyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey,
          privateKey
        })

        if (!keyStore) {
          // throw new BadRequestError('Error: Shop already registered!')
          return {
            code: 'xxxx',
            message: 'publicKeyString error'
          }
        }

        // create access token
        const tokens = await createTokenPair(
          { userId: newShop._id, email },
          publicKey,
          privateKey
        )

        return {
          code: 201,
          metaData: {
            shop: getInfoData({
              fileds: ['_id', 'name', 'email'],
              object: newShop
            }),
            tokens: tokens
          }
        }
      }
      return {
        code: 200,
        metaData: null
      }
    } catch (error) {
      return {
        code: 'xxx',
        message: error.message,
        status: 'error'
      }
    }
  }
}

module.exports = AccessService
