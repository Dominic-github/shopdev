'use strict'
const { cart } = require('../../models/cart.model')

const { Types } = require('mongoose')
const { METHOD_FAILURE } = require('../../utils/statusCodes')
const { convertToObjectMongodb } = require('../../utils')

const findCartById = async (cartId) => {
  return await cart
    .findOne({ _id: convertToObjectMongodb(cartId), cart_state: 'active' })
    .lean()
}

module.exports = {
  findCartById
}
