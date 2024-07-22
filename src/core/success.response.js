'use strict'

const StatusCode = {
  OK: 200,
  CREATED: 201
}

const ReasonStatusCode = {
  CREATED: 'Created!',
  OK: 'Success'
}

class SuccessResponse {
  constructor({
    message,
    statusCode = StatusCode.OK,
    reasonStatusCode = ReasonStatusCode.OK,
    metaData = {}
  }) {
    this.message = !message ? reasonStatusCode : message
    this.status = statusCode
    this.metaData = metaData
  }

  send(res, headers = {}) {
    return res.status(this.status).json(this)
  }
}

class OK extends SuccessResponse {
  constructor({ message, metaData }) {
    super({ message, metaData })
  }
}

class Created extends SuccessResponse {
  constructor({
    message,
    options = {},
    statusCode = StatusCode.CREATED,
    reasonStatusCode = ReasonStatusCode.CREATED,
    metaData
  }) {
    super({ message, statusCode, reasonStatusCode, metaData })
    this.options = options
  }
}

module.exports = {
  OK,
  Created,
  SuccessResponse
}
