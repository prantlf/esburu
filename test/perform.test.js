const test = require('tehanu')('perform')
const { deepStrictEqual } = require('assert')
const performTasks = require('../lib/tasks/perform')
const { clearBuilds, getBuilds } = require('./run/esbuild')

const opts = { esbuild: `${__dirname}/run/esbuild` }
const config = require('./run/estar.config')

test('performs a build with a config file', async () => {
  clearBuilds()
  await performTasks('test/run/estar.config.js', opts)
  deepStrictEqual(getBuilds(), [config])
})

test('performs a build with a config object', async () => {
  clearBuilds()
  await performTasks(config, opts)
  deepStrictEqual(getBuilds(), [config])
})
