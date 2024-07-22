'use strict'

const { NotFoundError, BadRequestError } = require('../core/error.response')
const { findCartById } = require('../models/repository/cart.repo')
const { checkProductByServer } = require('../models/repository/product.repo')
const { getDiscountAmount } = require('./discount.service')
const { acquireLock, releaseLock } = require('./redis.service')
const order = require('../models/order.model')
const { deleteUserCart } = require('./cart.service')

/*
  {
      cartId,
      userId,
      shop_order_ids: [
          {
              shopId,
              shop_discounts: [
                  {
                      shopId,
                      discountId,
                      codeId
                  }
              ],
              item_products: [
                  {
                      price,
                      quantity,
                      productId
                  }
              ]
          }
      ]
  }
*/

class OrderService {
  static async checkoutReview({ cartId, userId, shop_order_ids }) {
    const foundCartId = await findCartById(cartId)
    if (!foundCartId) {
      throw new NotFoundError('Cart is not found')
    }

    const checkout_order = {
        totalPrice: 0, // tong tien hang
        feeShip: 0, // phi van chuyen
        totalDiscount: 0, // tong tien giam gia
        totalCheckout: 0 // tong thanh toan
      },
      shop_order_ids_new = []

    //tinh tong tien bill
    for (let i = 0; i < shop_order_ids.length; i++) {
      const { shopId, shop_discounts, item_products } = shop_order_ids[i]

      const checkProductServer = await checkProductByServer(item_products)
      if (!checkProductServer[0]) throw new BadRequestError('order wrong')

      const checkoutPrice = checkProductServer.reduce(
        (acc, product) => acc + product.price * product.quantity,
        0
      )

      checkout_order.totalPrice += checkoutPrice

      const itemCheckout = {
        shopId,
        shop_discounts,
        priceRaw: checkoutPrice,
        priceApplyDiscount: checkoutPrice,
        item_products: checkProductServer
      }

      // neu shop_discounts ton tai > 0, check valid
      if (shop_discounts.length > 0) {
        const { totalPrice, discount = 0 } = await getDiscountAmount({
          codeId: shop_discounts[0].codeId,
          userId,
          shopId,
          products: checkProductServer
        })
        // tong cong discount giam gia
        checkout_order.totalDiscount += discount
        if (discount > 0) {
          itemCheckout.priceApplyDiscount = checkoutPrice - discount
        }
      }

      // tong tien cuoi cung
      checkout_order.totalCheckout += itemCheckout.priceApplyDiscount
      shop_order_ids_new.push(itemCheckout)

      return {
        shop_order_ids,
        shop_order_ids_new,
        checkout_order
      }
    }
  }

  static async orderByUser({
    shop_order_ids,
    cartId,
    userId,
    user_address = {},
    user_payment = {}
  }) {
    const { shop_order_ids_new, checkout_order } =
      await OrderService.checkoutReview({
        cartId,
        userId,
        shop_order_ids
      })

    // check lai ton kho
    const products = shop_order_ids_new.flatMap((order) => order.item_products)

    const acquireProduct = []
    for (let i = 0; i < products.length; i++) {
      console.log(products[i])
      const { productId, quantity } = products[i]
      const keyLock = await acquireLock(productId, quantity, cartId)
      acquireProduct.push(keyLock ? true : false)

      if (keyLock) {
        await releaseLock(keyLock)
      }
    }

    // check lai neu 1 sp het hang
    if (acquireProduct.includes(false)) {
      throw new BadRequestError('Some Product is update. Please come back cart')
    }

    // const newOrder = await order.create({
    //   order_userId: userId,
    //   order_checkout: checkout_order,
    //   order_shipping: user_address,
    //   order_payment: user_payment,
    //   order_products: shop_order_ids_necheckout_orderw
    // })

    // // truong hop neu insert thanh cong, thi remove product co trong cart
    // if (newOrder) {
    //   // remove product in my cart
    //   shop_order_ids_new.map(async (product) => {
    //     const { productId } = product
    //     await deleteUserCart({ userId, productId })
    //   })
    // }

    return newOrder
  }

  static async getOrderByUser() {}

  static async getOneOrderByUser() {}

  static async cancelOrderByUser() {}

  static async updateOrderStatusByShop() {}
}

module.exports = OrderService
