const test = require('tehanu')('find')
const { rejects, strictEqual } = require('assert')
const findTasks = require('../lib/tasks/find')

test('checks the path', async () =>
  strictEqual(await findTasks('test/find/esburu.config.js'),
    'test/find/esburu.config.js')
)

test('checks the ancestors', async () => {
  const cwd = process.cwd()
  try {
    process.chdir('test/find/src')
    strictEqual(await findTasks('esburu.config.js'), '../esburu.config.js')
  } finally {
    process.chdir(cwd)
  }
})

test('fails if no file is found', () => rejects(() => findTasks()))
