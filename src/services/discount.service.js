'use strict'

const { BadRequestError, NotFoundError } = require('../core/error.response')
const discount = require('../models/discount.model')
const { findAllProduct } = require('../models/repository/product.repo')
const {
  findAllDiscountUnSelect,
  findAllDiscountSelect,
  checkDiscountExists
} = require('../models/repository/discount.repo')

const { convertToObjectMongodb } = require('../utils/index')

/*
 Discount Service 
 1. Generator Discount Code [Shop | Admin]
 2. Get discount amount [User]
 3. Get All Discount codes [User | Shop]
 4. Verify Discount Code [User]
 5. Delete Discount Code [Shop | Admin]
 6. Cancel Discount Code [User]
*/

class DiscountService {
  static async createDiscountCode(body) {
    const {
      code,
      start_date,
      end_date,
      is_active,
      shopId,
      min_order_value,
      products_ids,
      applies_to,
      name,
      description,
      type,
      value,
      max_value,
      max_uses,
      uses_count,
      users_used,
      max_uses_per_user
    } = body

    // Check data
    if (new Date() < new Date(start_date) || new Date(end_date) < new Date()) {
      throw new BadRequestError('Discount code has expired')
    }

    if (new Date(start_date) > new Date(end_date)) {
      throw new BadRequestError(
        'Discount code start date should be before end date'
      )
    }

    // create index for discount code

    const foundDiscount = await discount
      .findOne({
        discount_code: code,
        discount_shop_id: convertToObjectMongodb(shopId)
      })
      .lean()

    if (foundDiscount) {
      throw new BadRequestError('Discount code already exists')
    }

    const newDiscount = await discount.create({
      discount_code: code,
      discount_start_date: new Date(start_date),
      discount_end_date: new Date(end_date),
      discount_is_active: is_active,
      discount_shop_id: convertToObjectMongodb(shopId),
      discount_min_order_value: min_order_value || 0,
      discount_product_ids: applies_to === 'all' ? [] : products_ids,
      discount_applies_to: applies_to,
      discount_name: name,
      discount_max_value: max_value,
      discount_description: description,
      discount_type: type,
      discount_value: value,
      discount_max_uses: max_uses,
      discount_uses_count: uses_count,
      discount_users_used: users_used,
      discount_max_uses_per_user: max_uses_per_user
    })

    return newDiscount
  }

  static async updateDiscountCode() {}

  // Get all discount

  static async getAllDiscountCodesFromShop({ limit, page, shopId }) {
    const discounts = await findAllDiscountUnSelect({
      limit: +limit,
      page: +page,
      filter: {
        discount_shop_id: convertToObjectMongodb(shopId),
        discount_is_active: true
      },
      unSelect: ['__v', 'discount_shop_id'],
      model: discount
    })
    return discounts
  }

  static async getAllDiscountCodesWithProduct({
    code,
    shopId,
    userId,
    limit,
    page
  }) {
    // create index for discount codes
    const foundDiscount = await discount
      .findOne({
        discount_code: code,
        discount_shop_id: convertToObjectMongodb(shopId)
      })
      .lean()

    if (!foundDiscount || !foundDiscount.discount_is_active) {
      throw new NotFoundError('Discount is not exist')
    }

    // get user discount codes
    let userDiscountCodes = []
    if (userId) {
      userDiscountCodes = await discount
        .find({
          discount_users_used: { $in: [convertToObjectMongodb(userId)] },
          discount_shop_id: convertToObjectMongodb(shopId)
        })
        .lean()
    }

    const { discount_applies_to, discount_product_ids } = foundDiscount
    let products
    if (discount_applies_to == 'all') {
      // get all product form shop
      products = await findAllProduct({
        filter: {
          product_shop: convertToObjectMongodb(shopId),
          isPublished: true
        },
        limit: +limit,
        page: +page,
        sort: 'ctime',
        select: ['product_name', 'product_shop', 'product_price']
      })
    }

    if (discount_applies_to === 'specific') {
      products = await findAllProduct({
        _id: { $in: discount_product_ids },
        isPublished: true
      })
        .select('product_name')
        .lean()
    }
    return products
  }

  static async getDiscountAmount({ codeId, userId, shopId, products }) {
    const foundDiscount = await checkDiscountExists({
      model: discount,
      filter: {
        discount_code: codeId,
        discount_shop_id: convertToObjectMongodb(shopId)
      }
    })

    if (!foundDiscount || !foundDiscount.discount_is_active) {
      throw new NotFoundError('Discount does not exist')
    }

    const {
      discount_is_active,
      discount_max_uses,
      discount_start_date,
      discount_end_date,
      discount_min_order_value,
      discount_max_uses_per_user,
      discount_type,
      discount_value,
      discount_users_used
    } = foundDiscount

    if (!discount_is_active) {
      throw new BadRequestError('Discount code has expired')
    }

    if (!discount_max_uses) {
      throw new BadRequestError('Discount are out!')
    }

    if (
      new Date() < new Date(discount_start_date) ||
      new Date() > new Date(discount_end_date)
    ) {
      throw new BadRequestError('Discount code has expired')
    }

    // min amount with discount
    let totalOrder = 0
    if (discount_min_order_value > 0) {
      // get total
      totalOrder = products.reduce((acc, product) => {
        return acc + product.quantity * product.price
      }, 0)

      if (totalOrder < discount_min_order_value) {
        throw new BadRequestError(
          `Order total is less than minimum order value of ${discount_min_order_value}`
        )
      }
    }

    if (discount_max_uses_per_user > 0) {
      const userDiscount = discount_users_used.find(
        (user) => user.id === userId
      )

      if (userDiscount) {
        throw new BadRequestError(
          'User has exceeded the maximum number of discount codes allowed'
        )
      }
    }

    const amount =
      discount_type === 'fixed_amount'
        ? discount_value
        : totalOrder * (discount_value / 100)

    return {
      totalOrder,
      discount: amount,
      totalPrice: totalOrder - amount
    }
  }

  static async deleteDiscountCode({ codeId, shopId }) {
    const deleted = await discount.findOneAndDelete({
      discount_code: codeId,
      discount_shop_id: convertToObjectMongodb(shopId)
    })
    return deleted
  }

  static async cancelDiscountCode({ codeId, shopId, userId }) {
    const foundDiscount = await checkDiscountExists({
      discount,
      filter: {
        discount_code: codeId,
        discount_shop_id: convertToObjectMongodb(shopId)
      }
    })

    if (!foundDiscount) throw new NotFoundError(`Discount ${codeId} not found `)

    const result = await discount.findByIdAndUpdate(foundDiscount._id, {
      $pull: {
        discount_users_used: convertToObjectMongodb(userId)
      },
      $inc: {
        discount_max_uses: 1,
        discount_uses_count: -1
      }
    })

    return result
  }
}

module.exports = DiscountService
