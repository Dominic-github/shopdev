'use strict'

const OrderService = require('../services/order.service')
const { OK, Created, SuccessResponse } = require('../core/success.response')

class OrderController {
  checkoutReview = async (req, res, next) => {
    new SuccessResponse({
      message: 'Checkout review success!',
      metaData: await OrderService.checkoutReview(req.body)
    }).send(res)
  }

  orderByUser = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get orders by user success!',
      data: await OrderService.orderByUser(req.body)
    }).send(res)
  }
}

module.exports = new OrderController()
