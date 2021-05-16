const { dirname } = require('path')
const { log, enableLog } = require('../shared/log')
const findTasks = require('./find')
const loadTasks = require('./load')
const expandTasks = require('./expand')
const runTasks = require('./run')
const { setOpts } = require('../util')

module.exports = async function performTasks(config, options = {}) {
  const { depth, debug } = options
  /* c8 ignore next */
  if (debug) enableLog()
  const path = await findTasks(config, depth)
  setOpts(options)
  const tasks = loadTasks(path)
  const cwd = process.cwd()
  try {
    const dir = dirname(path)
    log('changing directory to "%s"', dir)
    process.chdir(dir)
    await runTasks(await expandTasks(tasks, options), options)
  } finally {
    log('changing directory to "%s"', cwd)
    process.chdir(cwd)
  }
}
