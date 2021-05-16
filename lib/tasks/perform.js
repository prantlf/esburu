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
  setOpts(options)
  let path, tasks, cwd
  if (config == null || typeof config === 'string') {
    path = await findTasks(config, depth)
    tasks = loadTasks(path)
    cwd = process.cwd()
  } else {
    tasks = config
  }
  try {
    if (cwd) {
      const dir = dirname(path)
      log('changing directory to "%s"', dir)
      process.chdir(dir)
    }
    await runTasks(await expandTasks(tasks, options), options)
  } finally {
    if (cwd) {
      log('changing directory to "%s"', cwd)
      process.chdir(cwd)
    }
  }
}
