'use strict'

const { product, clothing, electronic } = require('../models/product.model')

const { BadRequestError } = require('../core/error.response')

//define Factory class to create product

class ProductFactory {
  static async createProduct(type, payload) {
    switch (type) {
      case 'Electronis':
        return new Electronic(payload).createProduct()
      case 'Clothing':
        return new Clothing(payload).createProduct()
      default:
        throw new BadRequestError(`Invalid Product type: ${payload.type}`)
    }
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
    return await product.create({ ...this, _id: product_id })
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
}

// Electronic
class Electronic extends Product {
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

module.exports = ProductFactory
