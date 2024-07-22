'use strict'

const keyTokenModel = require('../models/keyToken.model')
const {
  Types: { ObjectId }
} = require('mongoose')

class KeyTokenService {
  static createKeyToken = async ({
    userId,
    publicKey,
    privateKey,
    refreshToken
  }) => {
    try {
      // level 0
      // const tokens = await keyTokenModel.create({
      //   user: userId,
      //   publicKey: publicKey,
      //   privateKey: privateKey
      // })
      // return tokens ? tokens.publicKey : null

      // level xxx

      const filter = { user: userId },
        update = {
          publicKey: publicKey,
          privateKey: privateKey,
          refreshTokensUsed: [],
          refreshToken
        },
        options = { upsert: true, new: true }

      const tokens = await keyTokenModel.findOneAndUpdate(
        filter,
        update,
        options
      )

      return tokens ? tokens.publicKey : null
    } catch (error) {
      throw new Error(error)
    }
  }

  static findByUserId = async (userId) => {
    return await keyTokenModel.findOne({ user: new ObjectId(userId) })
  }
  static removeKeyById = async (id) => {
    return await keyTokenModel.deleteOne({ _id: new ObjectId(id) })
  }

  static findByRefreshToken = async (refreshToken) => {
    return await keyTokenModel.findOne({ refreshToken })
  }
  static findByRefreshTokenUsed = async (refreshToken) => {
    return await keyTokenModel
      .findOne({ refreshTokensUsed: refreshToken })
      .lean()
  }

  static deleteKeyById = async (userId) => {
    return await keyTokenModel.deleteOne({ user: new ObjectId(userId) })
  }
}

module.exports = KeyTokenService
