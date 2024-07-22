'use strict'

const express = require('express')
const accessController = require('../../controllers/access.controller')
const asyncHandler = require('../../helpers/asyncHandler')
const { authentication } = require('../../auth/authUtils')
const router = express.Router()

// signup
router.post('/signup', asyncHandler(accessController.signUp))

// login
router.post('/login', asyncHandler(accessController.login))

// Authentication

router.use(authentication)
router.post('/logout', asyncHandler(accessController.logout))
router.post(
  '/handlerRefreshToken',
  asyncHandler(accessController.handlerRefreshToken)
)

module.exports = router
