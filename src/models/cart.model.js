'use strict'

const { model, Schema } = require('mongoose') // Erase if already required

const DOCUMENT_NAME = 'Cart'
const COLLECTION_NAME = 'Carts'

// Declare the Schema of the Mongo model
var cartSchema = new Schema(
  {
    cart_state: {
      type: String,
      enum: ['active', 'completed', 'failed', 'pending'],
      default: 'active',
      required: true
    },
    cart_products: {
      type: Array,
      required: true,
      default: []
    },
    cart_count_product: { type: Number, required: true, default: 0 },
    cart_userId: { type: Number, required: true }
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true
  }
)

//Export the model
module.exports = { cart: model(DOCUMENT_NAME, cartSchema) }
