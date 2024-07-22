'use strict'

const InventoryService = require('../services/inventory.service')
const { OK, Created, SuccessResponse } = require('../core/success.response')

class InventoryController {
  addStockToInventory = async (req, res, next) => {
    new SuccessResponse({
      message: 'Add Stock success!',
      metaData: await InventoryService.addStockToInventory(req.body)
    }).send(res)
  }
}

module.exports = new InventoryController()
