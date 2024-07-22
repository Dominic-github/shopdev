'use strict'

const { model, Schema } = require('mongoose') // Erase if already required

const DOCUMENT_NAME = 'Discount'
const COLLECTION_NAME = 'Discounts'

// Declare the Schema of the Mongo model
var discountSchema = new Schema(
  {
    discount_name: { type: String, required: true },
    discount_description: { type: String, required: true },
    discount_type: { type: String, default: 'fixed_amount' }, // percentage: %, default: 10.000
    discount_value: { type: Number, required: true },
    discount_max_value: { type: Number, required: true },
    discount_code: { type: String, required: true },
    discount_start_date: { type: Date, required: true },
    discount_end_date: { type: Date, required: true },
    discount_max_uses: { type: Number, required: true }, // number of discount applies
    discount_uses_count: { type: Number, required: true }, // number of discount used
    discount_users_used: { type: Array, default: [] }, // who used the discount
    discount_max_uses_per_user: { type: Number, required: true }, // max uses per user
    discount_min_order_value: { type: Number, required: true, default: 0 }, // min order value
    discount_shop_id: { type: Schema.Types.ObjectId, ref: 'Shop' },
    discount_is_active: { type: Boolean, default: true }, //
    discount_applies_to: {
      type: String,
      required: true,
      enum: ['all', 'specific']
    },
    discount_product_ids: { type: Array, default: [] }
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true
  }
)

//Export the model
module.exports = model(DOCUMENT_NAME, discountSchema)
