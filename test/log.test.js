const test = require('tehanu')('log')
const { deepStrictEqual } = require('assert')
const { formatTask } = require('../lib/shared/log')

test('formatTask with outfile', () => {
  const task = { entryPoints: ['test.ts'], outfile: 'test.js' }
  deepStrictEqual(formatTask(task), { in: ['test.ts'], out: 'test.js' })
})

test('formatTask with outdir', () => {
  const task = { entryPoints: ['test.ts'], outdir: 'dist' }
  deepStrictEqual(formatTask(task), { in: ['test.ts'], out: 'dist' })
})
