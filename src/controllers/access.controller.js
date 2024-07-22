'use strict'

const AccessService = require('../services/access.service')

const { OK, Created, SuccessResponse } = require('../core/success.response')

class AccessController {
  handlerRefreshToken = async (req, res, next) => {
    // v1
    // new SuccessResponse({
    //   message: 'Get token success!',
    //   metaData: await AccessService.handlerRefreshToken(req.body.refreshToken)
    // }).send(res)

    // v2
    new SuccessResponse({
      message: 'Get token success!',
      metaData: await AccessService.handlerRefreshTokenV2({
        refreshToken: req.refreshToken,
        user: req.user,
        keyStore: req.keyStore
      })
    }).send(res)
  }

  logout = async (req, res, next) => {
    new SuccessResponse({
      message: 'Logout success!',
      metaData: await AccessService.logout(req.keyStore)
    }).send(res)
  }

  login = async (req, res, next) => {
    new SuccessResponse({
      message: await AccessService.login(req.body)
    }).send(res)
  }
  signUp = async (req, res, next) => {
    new Created({
      message: 'Regiserted OK!',
      metaData: await AccessService.signUp(req.body),
      options: {
        limid: 10
      }
    }).send(res)
  }
}

module.exports = new AccessController()
