const test = require('tehanu')('run')
const { ok, rejects, strictEqual, deepStrictEqual } = require('assert')
const runTasks = require('../lib/tasks/run')
const { clearBuilds, getBuilds } = require('./run/esbuild')

const mock = { esbuild: `${__dirname}/run/esbuild` }

test('does nothing for a falsy object', async () => {
  await runTasks(null, { esbuild: '!@#$' })
})

test('runs a single task', async () => {
  const config = { entryPoints: ['test.ts'], outfile: 'test.js' }
  clearBuilds()
  await runTasks(config, mock)
  deepStrictEqual(getBuilds(), [config])
})

test('runs two tasks in a sequence', async () => {
  const config = {
    parallel: false,
    tasks: [
      { entryPoints: ['src/index.ts'], outfile: 'dist/index.js' },
      { entryPoints: ['test/test.ts'], outfile: 'test/test.js' }
    ]
  }
  clearBuilds()
  await runTasks(config, mock)
  deepStrictEqual(getBuilds(), config.tasks)
})

test('runs two tasks in parallel', async () => {
  const config = {
    parallel: true,
    tasks: [
      { entryPoints: ['src/index.ts'], outfile: 'dist/index.js' },
      { entryPoints: ['test/test.ts'], outfile: 'test/test.js' }
    ]
  }
  clearBuilds()
  await runTasks(config, mock)
  const builds = getBuilds()
  strictEqual(builds.length, 2)
  const { tasks } = config
  ok(tasks[0].outfile === builds[0].outfile && tasks[1].outfile === builds[1].outfile ||
    tasks[0].outfile === builds[1].outfile && tasks[1].outfile === builds[0].outfile)
})

test('runs two tasks in parallel by default', async () => {
  const tasks = [
    { entryPoints: ['src/index.ts'], outfile: 'dist/index.js' },
    { entryPoints: ['test/test.ts'], outfile: 'test/test.js' }
  ]
  clearBuilds()
  await runTasks(tasks, { parallelDefault: true, ...mock })
  const builds = getBuilds()
  strictEqual(builds.length, 2)
  ok(tasks[0].outfile === builds[0].outfile && tasks[1].outfile === builds[1].outfile ||
    tasks[0].outfile === builds[1].outfile && tasks[1].outfile === builds[0].outfile)
})

test('runs nested tasks', async () => {
  const config = [
    [
      { entryPoints: ['src/first.ts'], outfile: 'dist/first.js' },
      { entryPoints: ['src/second.ts'], outfile: 'test/second.js' }
    ],
    { entryPoints: ['test/test.ts'], outfile: 'test/test.js' }
  ]
  clearBuilds()
  await runTasks(config, mock)
  const builds = getBuilds()
  deepStrictEqual(getBuilds(), [...config[0], config[1]])
})

test('fails with an unsupported value for a build configuration', () => {
  rejects(() => runTasks(1))
})

test('fails with an unsupported value for a task sequence', () => {
  rejects(() => runTasks({ parallel: false, tasks: {} }))
})
