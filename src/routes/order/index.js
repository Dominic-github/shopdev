'use strict'

const express = require('express')
const OrderController = require('../../controllers/order.controller')
const asyncHandler = require('../../helpers/asyncHandler')
const { authenticationV2 } = require('../../auth/authUtils')
const router = express.Router()

// Authentication
// router.use(authenticationV2)

router.post('/review', asyncHandler(OrderController.checkoutReview))
router.post('/', asyncHandler(OrderController.orderByUser))

module.exports = router
