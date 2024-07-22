'use strict'

const CartService = require('../services/cart.service')
const { OK, Created, SuccessResponse } = require('../core/success.response')

/**
 * - Add product to cart - user
 * - Reduce product quantity by one - user
 * - increase product quantity by one - user
 * - get cart - user
 * - delete cart - user
 * - delete cart item - user
 */

class CartController {
  /**
   * @desc Add to cart for user
   *
   * @type {function(*, *, *): void}
   * @method POST
   * @url /api/v1/cart
   * @return {}
   */

  addToCart = async (req, res, next) => {
    new SuccessResponse({
      message: 'Create new cart success!',
      metaData: await CartService.addToCart(req.body)
    }).send(res)
  }

  updateCart = async (req, res, next) => {
    new SuccessResponse({
      message: 'Updated cart success!',
      metaData: await CartService.addToCartV2(req.body)
    }).send(res)
  }

  deleteCart = async (req, res, next) => {
    new SuccessResponse({
      message: 'Deleted cart success!',
      metaData: await CartService.deleteUserCart(req.body)
    }).send(res)
  }

  listToCart = async (req, res, next) => {
    console.log(req.query)
    new SuccessResponse({
      message: 'Get List cart success!',
      metaData: await CartService.getListUserCart(req.query)
    }).send(res)
  }
}

module.exports = new CartController()
