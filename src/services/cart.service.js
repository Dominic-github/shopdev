'use strict'

const cartModel = require('../models/cart.model')
const { getProductById } = require('../models/repository/product.repo')
const { NotFoundError } = require('../core/error.response')

/**
 * - Add product to cart - user
 * - Reduce product quantity by one - user
 * - increase product quantity by one - user
 * - get cart - user
 * - delete cart - user
 * - delete cart item - user
 */

class CartService {
  static async createCart({ userId, product = {} }) {
    const query = { cart_userId: userId, cart_state: 'active' },
      updateOrInsert = {
        $addToSet: {
          cart_products: product
        }
      },
      options = { upsert: true, new: true }

    return await cartModel.findOneAndUpdate(query, updateOrInsert, options)
  }

  static async updateUserCartQuantity({ userId, product = {} }) {
    const { productId, quantity } = product

    const query = {
        cart_userId: userId,
        'cart_products.productId': productId,
        cart_state: 'active'
      },
      updateSet = { $inc: { 'cart_products.$.quantity': quantity } },
      options = { upsert: true, new: true }

    return await cartModel.findOneAndUpdate(query, updateSet, options)
  }

  static async addToCart({ userId, product = {} }) {
    const userCart = await cartModel.findOne({ cart_userId: userId })

    if (!userCart) {
      return await CartService.createCart({ userId: userId, product })
    }

    if (!(userCart.cart_products == [])) {
      userCart.cart_products = [product]
      return await userCart.save()
    }

    return await CartService.updateUserCartQuantity({ userId, product })
  }

  // update cart
  /**
   * shop_order_ids: [
   *  {
   *      shopId,
   *      item_products: [
   *          {
   *              quantity,
   *              price,
   *              shopId,
   *              old_quantity,
   *              productId
   *          }
   *      ],
   *      version
   *  }
   * ]
   */

  static async addToCartV2({ userId, shop_order_ids = [] }) {
    const { productId, quantity, old_quantity } =
      shop_order_ids[0]?.item_products[0]
    const foundProduct = await getProductById({ product_id: productId })
    if (!foundProduct) throw new NotFoundError('Product not found')

    //compare
    if (foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId)
      throw new NotFoundError('Shop not found')

    if (quantity === 0) {
      // delete
    }

    return await CartService.updateUserCartQuantity({
      userId,
      product: {
        productId,
        quantity: quantity - old_quantity
      }
    })
  }

  static async deleteUserCart({ userId, productId }) {
    const query = { cart_userId: userId, cart_state: 'active' }
    const updateSet = {
      $pull: {
        cart_products: {
          productId
        }
      }
    }

    return await cartModel.updateOne(query, updateSet)
  }

  static async getListUserCart({ userId }) {
    return await cartModel
      .findOne({
        cart_userId: +userId
      })
      .lean()
  }
}

module.exports = CartService
