const glob = require('tiny-glob')
const parallelize = require('../shared/parallelize')
const { log } = require('../shared/log')

const placeholder = /\[[^.\]]+\]/g

function parseInput(input) {
  const names = []
  const pattern = input.replace(placeholder, name => {
    names.push(name)
    return '*'
  })
  const regexp = new RegExp(
    `^${input.replace(placeholder, '([^/]+)').replace(/\./g, '\\.')}$`
  )
  return { input, pattern, regexp, names }
}

function getValues(regexp, file) {
  log('matching "%s" with %s', file, regexp)
  const match = regexp.exec(file)
  return match && match.slice(1)
}

function formatOutput(regexp, names, file, output) {
  const values = getValues(regexp, file)
  return output.replace(placeholder, name => {
    const index = names.indexOf(name)
    if (index < 0) throw new Error(`unrecognised placeholder "${name}" in "${output}"`)
    return values[index]
  })
}

const cache = {}

async function getFiles(pattern) {
  let files = cache[pattern]
  if (!files) {
    log('globbing "%s"', pattern)
    files = cache[pattern] = await glob(pattern)
  }
  return files
}

function filterFiles(files, regexp, names) {
  return files.filter(file => {
    const values = getValues(regexp, file)
    /* c8 ignore next 4 */
    if (names.length !== values.length) {
      log('dropping "%s", %d placeholders for %d values', file, names.length, values.length)
      return
    }
    const map = {}
    for (let i = 0, l = names.length; i < l; ++i) {
      const name = names[i]
      const value = values[i]
      const old = map[name]
      if (old) {
        if (old !== value) {
          log('dropping "%s", inconsistent "%s": "%s" != "%s"', file, name, old, value)
          return
        }
        return true
      }
      map[name] = value
    }
    return true
  })
}

function expandFiles(task, files, regexp, names) {
  return files.map(file => {
    const clone = { ...task }
    const { outfile, outdir } = clone
    clone.entryPoints = [file]
    if (outfile) clone.outfile = updateTarget(outfile, file)
    else clone.outdir = updateTarget(outdir, file)
    return clone
  })

  function updateTarget(target, source) {
    const file = formatOutput(regexp, names, source, target)
    log('new output "%s" for "%s"', file, target)
    return file
  }
}

function applyOptions(task, options) {
  if (task.watch === undefined && options.watch !== undefined)
    task.watch = options.watch
  if (task.logLevel === undefined && options.verbose) task.logLevel = 'debug'
}

async function expandTask(task, options) {
  applyOptions(task, options)
  const { entryPoints } = task
  log('expanding "%o"', entryPoints)
  if (entryPoints.length !== 1) return task
  const input = entryPoints[0]
  const { pattern, regexp, names } = parseInput(input)
  if (!names.length) return task
  let files = await getFiles(pattern)
  log('%d files found for "%s".', files.length, pattern)
  files = filterFiles(files, regexp, names)
  log('%d files matched "%s".', files.length, input)
  if (!files.length) throw new Error(`nothing matched "${input}"`)
  const result = expandFiles(task, files, regexp, names)
  return result.length > 1 ? result : result[0]
}

async function expandSequence(tasks, options, inparallel) {
  const expanded = []
  await parallelize(tasks.map((task, index) => async () =>
    expanded[index] = await expandTasks(task, options)))
  const parallel = options.parallelDefault !== false && !inparallel
  const flattened = expanded.reduce((result, task) => {
    if (task)
      if (Array.isArray(task)) {
        if (parallel) result.push({ parallel, tasks: task })
        else result.push(...task)
      } else {
        result.push(task)
      }
    return result
  }, [])
  return flattened.length === 1 && flattened[0].parallel ? flattened[0] : flattened
}

async function expandTasks(config, options = {}) {
  if (!config) return config
  if (Array.isArray(config)) return expandSequence(config, options, false)
  if (typeof config === 'object') {
    if (config.parallel !== undefined) {
      const { tasks } = config
      if (Array.isArray(tasks)) {
        config.tasks = await expandSequence(tasks, options, true)
        return config
      }
      throw new Error('nested configuration requires an array of tasks')
    }
    return expandTask(config, options)
  }
  throw new Error('tasks have to be an array or an object')
}

module.exports = expandTasks
