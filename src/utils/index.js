'use strict'

const _ = require('lodash')
const { Types } = require('mongoose')

const convertToObjectMongodb = (id) => new Types.ObjectId(id)

const getInfoData = ({ fileds = [], object = {} }) => {
  return _.pick(object, fileds)
}

const getSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 1]))
}

const getUnSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 0]))
}

const removeUndefinedNullObject = (obj) => {
  const result = {}
  Object.keys(obj).forEach((k) => {
    const current = obj[k]

    if ([null, undefined].includes(current)) return
    if (Array.isArray(current)) return

    if (typeof current === 'object') {
      result[k] = removeUndefinedNullObject(current)
      return
    }
    result[k] = current
  })

  return result
}

const updateNestedObject = ({ target, payload }) => {
  payload = removeUndefinedNullObject(payload)
  for (let key in target) {
    if (_.isPlainObject(target[key])) {
      target[key] = updateNestedObject({
        target: target[key],
        payload: payload[key]
      })
    } else if (key in payload) {
      target[key] = payload[key]
    }
  }
  return target
}

module.exports = {
  convertToObjectMongodb,
  getInfoData,
  getSelectData,
  getUnSelectData,
  removeUndefinedNullObject,
  updateNestedObject
}
