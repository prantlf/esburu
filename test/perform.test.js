const test = require('tehanu')('perform')
const { deepStrictEqual } = require('assert')
const performTasks = require('../lib/tasks/perform')
const { clearBuilds, getBuilds } = require('./run/esbuild')

const mock = { esbuild: `${__dirname}/run/esbuild` }

test('performs a build', async () => {
  clearBuilds()
  await performTasks('test/run/estar.config.js', mock)
  deepStrictEqual(getBuilds(), [require('./run/estar.config')])
})
