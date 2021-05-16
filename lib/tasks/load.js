const { resolve } = require('path')
const { log } = require('../shared/log')

module.exports = function loadTasks(config) {
  try {
    log('requiring "%s"', config)
    return require(resolve(config))
  } catch (err) {
    err.config = true
    throw err
  }
}
