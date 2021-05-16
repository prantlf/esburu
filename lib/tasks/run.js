const parallelize = require('../shared/parallelize')
const { log, formatTask } = require('../shared/log')
let build

async function runTask(task) {
  log('running task %o', formatTask(task))
  await build(task)
}

async function runSequence(tasks, options) {
  log('running %d tasks in sequence', tasks.length)
  for (const task of tasks) await runTasks(task, options)
}

async function runParallel(tasks, options) {
  await parallelize(
    tasks.map(task => () => runTasks(task, options)),
    set => log('running %d tasks in parallel', set.length),
    options.parallelism)
}

async function runTasks(config, options = {}) {
  if (!config) return
  /* c8 ignore next */
  if (!build) build = require(options.esbuild || 'esbuild').build
  if (Array.isArray(config)) {
    if (options.parallelDefault) await runParallel(config, options)
    else await runSequence(config, options)
  } else if (typeof config === 'object') {
    const { parallel } = config
    if (parallel !== undefined) {
      const { tasks } = config
      if (!Array.isArray(tasks))
        throw new Error('nested configuration requires an array of tasks')
      if (parallel) await runParallel(tasks, options)
      else await runSequence(tasks, options)
    } else {
      await runTask(config, options)
    }
  } else {
    throw new Error('tasks have to be an array or an object')
  }
}

module.exports = runTasks
