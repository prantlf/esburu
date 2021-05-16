const test = require('tehanu')('expand')
const { rejects, strictEqual, deepStrictEqual } = require('assert')
const expandTasks = require('../lib/tasks/expand')

test('skips one task with no placeholders', async () => {
  const tasks = { entryPoints: ['test.ts'], outfile: 'test.js' }
  strictEqual(await expandTasks(tasks), tasks)
})

test('skips multiple tasks with no placeholders', async () => {
  const tasks = [
    { entryPoints: ['index.ts'], outdir: 'dist' },
    { entryPoints: ['test.ts'], outfile: 'test.js' }
  ]
  deepStrictEqual(await expandTasks(tasks), tasks)
})

test('skips falsy objects', async () => {
  const tasks = [
    { entryPoints: ['index.ts'], outdir: 'dist' }, false
  ]
  deepStrictEqual(await expandTasks(tasks), tasks)
})

test('skips a task with multiple entry points', async () => {
  const tasks = { entryPoints: ['index.ts', 'test.ts'], outfile: 'test.js' }
  strictEqual(await expandTasks(tasks), tasks)
})

test('applies build options', async () => {
  deepStrictEqual(await expandTasks({
    entryPoints: ['index.ts']
  }, { watch: true, verbose: true }), {
    entryPoints: ['index.ts'], watch: true, logLevel: 'debug'
  })
})

test('finds files matching a pattern', async () => {
  deepStrictEqual(await expandTasks({
    entryPoints: ['test/expand/components/first/[name].ts'],
    outfile: 'dist/[name].js'
  }), [
    {
      entryPoints: ['test/expand/components/first/first.test.ts'],
      outfile: 'dist/first.test.js'
    },
    {
      entryPoints: ['test/expand/components/first/first.ts'],
      outfile: 'dist/first.js'
    }
  ])
})

test('filters files with inconsistent placeholder values', async () => {
  deepStrictEqual(await expandTasks({
    entryPoints: ['test/expand/components/[name]/[name].ts'],
    outdir: 'dist/[name]'
  }), [
    {
      entryPoints: ['test/expand/components/first/first.ts'],
      outdir: 'dist/first'
    },
    {
      entryPoints: ['test/expand/components/second/second.ts'],
      outdir: 'dist/second'
    }
  ])
})

test('does not create unnecessary arrays of tasks', async () => {
  deepStrictEqual(await expandTasks({
    entryPoints: ['test/expand/components/first/[name].test.ts'],
    outfile: 'dist/[name].test.js'
  }), {
    entryPoints: ['test/expand/components/first/first.test.ts'],
    outfile: 'dist/first.test.js'
  })
})

test('supports parallel lists of tasks', async () => {
  deepStrictEqual(await expandTasks({
    parallel: true,
    tasks: [{
      entryPoints: ['test/expand/components/first/[name].ts'],
      outfile: 'dist/[name].js'
    }]
  }), {
    parallel: true,
    tasks: [
      {
        entryPoints: ['test/expand/components/first/first.test.ts'],
        outfile: 'dist/first.test.js'
      },
      {
        entryPoints: ['test/expand/components/first/first.ts'],
        outfile: 'dist/first.js'
      }
    ]
  })
})

test('supports nested parallelism', async () => {
  deepStrictEqual(await expandTasks([
    {
      parallel: true,
      tasks: [{
        entryPoints: ['test/expand/components/[name]/[name].ts'],
        outfile: 'dist/[name].js'
      }]
    },
    {
      parallel: true,
      tasks: [{
        entryPoints: ['test/expand/components/[name]/[name].test.ts'],
        outfile: 'test/expand/components/[name]/[name].test.js'
      }]
    }
  ]), [
    {
      parallel: true,
      tasks: [
        {
          entryPoints: ['test/expand/components/first/first.ts'],
          outfile: 'dist/first.js'
        },
        {
          entryPoints: ['test/expand/components/second/second.ts'],
          outfile: 'dist/second.js'
        }
      ]
    },
    {
      parallel: true,
      tasks: [
        {
          entryPoints: ['test/expand/components/first/first.test.ts'],
          outfile: 'test/expand/components/first/first.test.js'
        },
        {
          entryPoints: ['test/expand/components/second/second.test.ts'],
          outfile: 'test/expand/components/second/second.test.js'
        }
      ]
    }
  ])
})

test('fails if the expanded path does not exist', () => {
  const task = { entryPoints: ['dummy/[name].ts'] }
  rejects(() => expandTasks(task))
})

test('fails if no file matches the pattern', () => {
  const task = { entryPoints: ['test/expand/components/first/[name].js'] }
  rejects(() => expandTasks(task))
})

test('fails if the placeholders do not match any path', () => {
  const task = { entryPoints: ['test/expand/[name]/[name]/[name].ts'] }
  rejects(() => expandTasks(task))
})

test('fails if the output contains a placeholder not in input', () => {
  const task = {
    entryPoints: ['test/expand/components/first/[name].ts'],
    outdir: 'dist/[other]'
  }
  rejects(() => expandTasks(task))
})

test('fails with an unsupported value for a build configuration', () => {
  rejects(() => expandTasks(1))
})

test('fails with an unsupported value for a task sequence', () => {
  rejects(() => expandTasks({ parallel: false, tasks: {} }))
})
