'use strict'
const express = require('express')
const { apiKey, permission } = require('../auth/checkAuth')
const { pustToLogDiscord } = require('../middlewares')
const router = express.Router()

// logger
router.use(pustToLogDiscord)
//check api
router.use(apiKey)
//check permission
router.use(permission('0000'))

router.use('/v1/api/auth', require('./access'))
router.use('/v1/api/shop', require('./shop'))
router.use('/v1/api/product', require('./product'))
router.use('/v1/api/discount', require('./discount'))
router.use('/v1/api/cart', require('./cart'))
router.use('/v1/api/order', require('./order'))
router.use('/v1/api/inventory', require('./inventory'))

module.exports = router
