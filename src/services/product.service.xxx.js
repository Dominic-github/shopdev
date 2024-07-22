'use strict'

const { product, clothing, electronic } = require('../models/product.model')

const { BadRequestError } = require('../core/error.response')
const {
  findAllDraftsForShop,
  publishProductByShop,
  findAllPublishForShop,
  searchProductByUser,
  unPublishProductByShop,
  findProduct,
  findAllProduct,
  updateProductById
} = require('../models/repository/product.repo')
const { insertInventory } = require('../models/repository/inventory.repo')

//define Factory class to create product

class ProductFactory {
  static productRegistry = {} // key - class

  static registerProductType(type, classRef) {
    if (ProductFactory.productRegistry[type]) {
      throw new Error(`Product type ${type} already registered`)
    }
    ProductFactory.productRegistry[type] = classRef
  }
  static async createProduct(type, payload) {
    const productClass = ProductFactory.productRegistry[type]
    if (!productClass) throw new Error(`Invalid Product ${type}!`)

    return new productClass(payload).createProduct()
  }

  static async updateProduct(type, product_id, payload) {
    const productClass = ProductFactory.productRegistry[type]
    if (!productClass) throw new Error(`Invalid Product ${type}!`)

    return new productClass(payload).updateProduct(product_id, payload)
  }

  // put
  static async publishProductByShop({ product_shop, product_id }) {
    return await publishProductByShop({ product_shop, product_id })
  }

  static async unPublishProductByShop({ product_shop, product_id }) {
    return await unPublishProductByShop({ product_shop, product_id })
  }

  // Query

  // query list of products draft
  static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isDraft: true }
    return await findAllDraftsForShop({ query, limit, skip })
  }

  // query list of products published
  static async findAllPublishForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isPublished: true }
    return await findAllPublishForShop({ query, limit, skip })
  }

  static async searchProduct({ keySearch }) {
    return await searchProductByUser({ keySearch })
  }

  static async findAllProduct({
    limit = 50,
    sort = 'ctime',
    page = 1,
    filter = { isPublished: true }
  }) {
    return await findAllProduct({
      limit,
      sort,
      filter,
      page,
      select: ['product_name', 'product_price', 'product_thumb']
    })
  }

  static async findProduct({ product_id }) {
    return await findProduct({ product_id, unSelect: ['__v'] })
  }
}

// define base product class

class Product {
  constructor({
    product_name,
    product_thumb,
    product_price,
    product_description,
    product_type,
    product_quantity,
    product_shop,
    product_attributes
  }) {
    this.product_name = product_name
    this.product_thumb = product_thumb
    this.product_description = product_description
    this.product_price = product_price
    this.product_quantity = product_quantity
    this.product_type = product_type
    this.product_shop = product_shop
    this.product_attributes = product_attributes
  }

  // create Product
  async createProduct(product_id) {
    const newProduct = await product.create({ ...this, _id: product_id })
    if (newProduct) {
      //add product_stock to inventory collection
      await insertInventory({
        productId: newProduct._id,
        shopId: this.product_shop,
        stock: this.product_quantity
      })
    }

    return newProduct
  }

  // update Product
  async updateProduct(product_id, payload) {
    return await updateProductById({ product_id, payload, model: product })
  }
}

// define sub-class for different product type clothing

class Clothing extends Product {
  async createProduct() {
    const newClothing = await clothing.create({
      ...this.product_attributes,
      product_shop: this.product_shop
    })
    if (!newClothing) throw new BadRequestError('Create new clothing failed')

    const newProduct = await super.createProduct(newClothing._id)

    if (!newProduct) throw new BadRequestError('Create new Product failed')

    return newProduct
  }

  static async updateProduct(product_id) {
    // Remove attr has null or undefined

    const objectParams = this

    if (objectParams.product_attributes) {
      await updateProductById({ product_id, payload, model: clothing })
    }

    const updateProduct = await super.updateProduct(product_id, objectParams)

    return updateProduct
  }
}

// Electronic
class Electronics extends Product {
  async createProduct() {
    const newElectronic = await electronic.create({
      ...this.product_attributes,
      product_shop: this.product_shop
    })
    if (!newElectronic) throw new BadRequestError('Create new clothing failed')

    const newProduct = await super.createProduct(newElectronic._id)

    if (!newProduct) throw new BadRequestError('Create new Product failed')

    return newProduct
  }
}

// register product types
ProductFactory.registerProductType('Electronics', Electronics)
ProductFactory.registerProductType('Clothing', Clothing)

module.exports = ProductFactory
