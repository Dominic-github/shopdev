'use strict'

const express = require('express')
const DiscountController = require('../../controllers/discount.controller')
const asyncHandler = require('../../helpers/asyncHandler')
const { authenticationV2 } = require('../../auth/authUtils')
const router = express.Router()

// get amount discount
router.post('/amount', asyncHandler(DiscountController.getDiscountAmount))
router.get(
  '/list_discount_code',
  asyncHandler(DiscountController.getAllDiscountCodeWithProduct)
)

// Authentication
router.use(authenticationV2)
router.get('', asyncHandler(DiscountController.getAllDiscountCode))
router.post('', asyncHandler(DiscountController.createDiscountCode))

module.exports = router
