const test = require('tehanu')('load')
const { throws, strictEqual } = require('assert')
const loadTasks = require('../lib/tasks/load')

test('loads a config', async () =>
  strictEqual(await loadTasks('test/load/estar.config.js'), 1)
)

test('fails with an invalid path', () => throws(() => loadTasks('dummy')))
