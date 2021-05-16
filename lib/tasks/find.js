const { constants } = require('fs')
const { access } = require('fs/promises')
const { basename } = require('path')
const { log } = require('../shared/log')

async function exists (file) {
  log('checking existence of "%s"', file)
  try {
    await access(file, constants.R_OK )
    return true
  } catch (err) {
    /* c8 ignore next */
    if (err.code !== 'ENOENT') throw err
  }
}

module.exports = async function findTasks(config = 'esburu.config.js', depth = 10) {
  if (basename(config) !== config) {
    if (await exists(config)) return config
  } else {
    for (let i = 0, path = config; i < depth; ++i, path = `../${path}`)
      if (await exists(path)) return path
  }
  throw new Error(`"${config}" not found`)
}
