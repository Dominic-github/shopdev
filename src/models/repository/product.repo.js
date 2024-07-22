'use strict'

const {
  getSelectData,
  getUnSelectData,
  updateNestedObject,
  convertToObjectMongodb
} = require('../../utils')
const { product, electronic, clothing } = require('../product.model')
const { Types } = require('mongoose')

const findAllDraftsForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip })
}

const findAllPublishForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip })
}
const unPublishProductByShop = async ({ product_shop, product_id }) => {
  const foundShop = await product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id)
  })

  if (!foundShop) return null

  foundShop.isDraft = true
  foundShop.isPublished = false

  const { modifiedCount } = await foundShop.updateOne(foundShop)
  // return updated 1 or 0
  return modifiedCount
}

const publishProductByShop = async ({ product_shop, product_id }) => {
  const foundShop = await product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id)
  })

  if (!foundShop) return null

  foundShop.isDraft = false
  foundShop.isPublished = true

  const { modifiedCount } = await foundShop.updateOne(foundShop)
  // return updated 1 or 0
  return modifiedCount
}

const searchProductByUser = async ({ keySearch }) => {
  const regexSearch = new RegExp(keySearch)
  const results = await product
    .find(
      {
        isPublished: true,
        $text: { $search: regexSearch }
      },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .lean()
  return results
}

const findAllProduct = async ({ limit, sort, page, filter, select }) => {
  const skip = (page - 1) * limit
  const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
  const products = await product
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean()

  return products
}

const findProduct = async ({ product_id, unSelect }) => {
  return await product.findById(product_id).select(getUnSelectData(unSelect))
}

const updateProductById = async ({
  product_id,
  payload,
  model,
  isNew = true
}) => {
  let target = await model.findById(product_id).lean()
  target = updateNestedObject({ target, payload })
  return await model.findByIdAndUpdate(product_id, target, {
    new: isNew
  })
}

const queryProduct = async ({ query, limit, skip }) => {
  return await product
    .find(query)
    .populate('product_shop', 'name email -_id')
    .sort({ updateAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
}

const getProductById = async ({ product_id, unSelect = [] }) => {
  return await product
    .findOne({ _id: convertToObjectMongodb(product_id) })
    .select(getUnSelectData(unSelect))
    .lean()
}

const checkProductByServer = async (products) => {
  return await Promise.all(
    products.map(async (product) => {
      const foundProduct = await getProductById({
        product_id: product.productId
      })
      if (foundProduct) {
        return {
          price: foundProduct.product_price,
          quantity: product.quantity,
          productId: product.productId
        }
      }
    })
  )
}

module.exports = {
  findAllDraftsForShop,
  publishProductByShop,
  unPublishProductByShop,
  searchProductByUser,
  findAllPublishForShop,
  findProduct,
  findAllProduct,
  updateProductById,
  getProductById,
  checkProductByServer
}
