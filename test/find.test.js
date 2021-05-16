const test = require('tehanu')('find')
const { rejects, strictEqual } = require('assert')
const findTasks = require('../lib/tasks/find')

test('checks the path', async () =>
  strictEqual(await findTasks('test/find/estar.config.js'),
    'test/find/estar.config.js')
)

test('checks the ancestors', async () => {
  const cwd = process.cwd()
  try {
    process.chdir('test/find/src')
    strictEqual(await findTasks('estar.config.js'), '../estar.config.js')
  } finally {
    process.chdir(cwd)
  }
})

test('fails if no file is found', () => rejects(() => findTasks()))
