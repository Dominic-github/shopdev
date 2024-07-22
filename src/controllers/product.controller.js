'use strict'

const productService = require('../services/product.service')
const productServiceV2 = require('../services/product.service.xxx')
const { SuccessResponse } = require('../core/success.response')

class ProductController {
  createProduct = async (req, res, next) => {
    new SuccessResponse({
      message: 'Product created successfully!',
      metaData: await productServiceV2.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId
      })
    }).send(res)
  }

  updateProduct = async (req, res, next) => {
    new SuccessResponse({
      message: 'Product updated successfully!',
      metaData: await productServiceV2.updateProduct(
        req.body.product_type,
        req.params.product_id,
        {
          ...req.body,
          product_shop: req.user.userId
        }
      )
    }).send(res)
  }

  publishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'PublishProductByShop successfully!',
      metaData: await productServiceV2.publishProductByShop({
        product_id: req.params.id,
        product_shop: req.user.userId
      })
    }).send(res)
  }

  unPublishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'UnpublishProductByShop successfully!',
      metaData: await productServiceV2.unPublishProductByShop({
        product_id: req.params.id,
        product_shop: req.user.userId
      })
    }).send(res)
  }

  // Query
  /**
   * @desc Get all drafs for shop
   * @param {String} req
   * @param {Number} limit
   * @param {Number} skip
   */
  getAllDraftForShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get list product draft success!',
      metaData: await productServiceV2.findAllDraftsForShop({
        product_shop: req.user.userId
      })
    }).send(res)
  }

  getAllPublishForShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get list product publish success!',
      metaData: await productServiceV2.findAllPublishForShop({
        product_shop: req.user.userId
      })
    }).send(res)
  }

  getListSearchProduct = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get list product search success!',
      metaData: await productServiceV2.searchProduct(req.params)
    }).send(res)
  }

  getAllListProduct = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get all product success!',
      metaData: await productServiceV2.findAllProduct(req.query)
    }).send(res)
  }

  getAllListProductUnPublish = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get all product success!',
      metaData: await productServiceV2.findAllProduct({
        ...req.query,
        filter: { isPublished: false }
      })
    }).send(res)
  }

  getProduct = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get all product success!',
      metaData: await productServiceV2.findProduct({
        product_id: req.params.product_id
      })
    }).send(res)
  }
}

module.exports = new ProductController()
