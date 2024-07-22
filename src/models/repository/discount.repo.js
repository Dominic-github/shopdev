'use strict'

const { getSelectData, getUnSelectData } = require('../../utils')

const findAllDiscountUnSelect = async ({
  limit = 50,
  page = 1,
  sort = 'ctime',
  filter,
  unSelect,
  model
}) => {
  const skip = (page - 1) * limit
  const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
  const discounts = await model
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getUnSelectData(unSelect))
    .lean()

  return discounts
}

const findAllDiscountSelect = async ({
  limit = 50,
  page = 1,
  sort = 'ctime',
  filter,
  select,
  model
}) => {
  const skip = (page - 1) * limit
  const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
  const discounts = await model
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean()

  return discounts
}

const checkDiscountExists = async ({ model, filter }) => {
  return await model.findOne(filter).lean()
}

module.exports = {
  findAllDiscountUnSelect,
  findAllDiscountSelect,
  checkDiscountExists
}
