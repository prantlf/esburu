const { enableLog } = require('./shared/log')
const findTasks = require('./tasks/find')
const loadTasks = require('./tasks/load')
const expandTasks = require('./tasks/expand')
const runTasks = require('./tasks/run')
const performTasks = require('./tasks/perform')
const { setOpts } = require('./util')

module.exports = {
  enableLog, setOpts, findTasks, loadTasks, expandTasks, runTasks, performTasks
}
