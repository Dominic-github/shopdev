'use strict'

const DiscountService = require('../services/discount.service')
const { OK, Created, SuccessResponse } = require('../core/success.response')

class DiscountController {
  createDiscountCode = async (req, res, next) => {
    new SuccessResponse({
      message: 'Create discount code success!',
      metaData: await DiscountService.createDiscountCode({
        ...req.body,
        shopId: req.user.userId
      })
    }).send(res)
  }

  getAllDiscountCode = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get all discount code success!',
      metaData: await DiscountService.getAllDiscountCodesFromShop({
        ...req.query,
        shopId: req.user.userId
      })
    }).send(res)
  }

  getDiscountAmount = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get discount amount success!',
      metaData: await DiscountService.getDiscountAmount({
        ...req.body
      })
    }).send(res)
  }

  getAllDiscountCodeWithProduct = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get all discount code with product success!',
      metaData: await DiscountService.getAllDiscountCodesWithProduct({
        ...req.query
      })
    }).send(res)
  }
}

module.exports = new DiscountController()
