'use strict'

const express = require('express')
const ProductController = require('../../controllers/product.controller')
const asyncHandler = require('../../helpers/asyncHandler')
const { authenticationV2 } = require('../../auth/authUtils')
const router = express.Router()

router.get(
  '/search/:keySearch',
  asyncHandler(ProductController.getListSearchProduct)
)
router.get('', asyncHandler(ProductController.getAllListProduct))
router.get(
  '/unpublished',
  asyncHandler(ProductController.getAllListProductUnPublish)
)
router.get('/:product_id', asyncHandler(ProductController.getProduct))

// Authentication
router.use(authenticationV2)

router.post('', asyncHandler(ProductController.createProduct))
router.patch('/:product_id', asyncHandler(ProductController.updateProduct))
router.post(
  '/publish/:id',
  asyncHandler(ProductController.publishProductByShop)
)

router.post(
  '/unpublish/:id',
  asyncHandler(ProductController.unPublishProductByShop)
)

// QUERY
router.get('/drafts/all', asyncHandler(ProductController.getAllDraftForShop))
router.get(
  '/published/all',
  asyncHandler(ProductController.getAllPublishForShop)
)

module.exports = router
