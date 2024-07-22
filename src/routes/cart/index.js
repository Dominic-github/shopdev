'use strict'

const express = require('express')
const CartController = require('../../controllers/cart.controller')
const asyncHandler = require('../../helpers/asyncHandler')
const { authenticationV2 } = require('../../auth/authUtils')
const router = express.Router()

// Authentication
router.use(authenticationV2)

router.get('/', asyncHandler(CartController.listToCart))
router.post('/', asyncHandler(CartController.addToCart))
router.post('/update', asyncHandler(CartController.updateCart))
router.delete('/', asyncHandler(CartController.deleteCart))

module.exports = router
