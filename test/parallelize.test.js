const test = require('tehanu')('parallelize')
const { ok, deepStrictEqual, strictEqual } = require('assert')
const parallelize = require('../lib/shared/parallelize')

function* range(end, start = 0, step = 1) {
  for (let x = start; x <= end; x += step) yield x
}

function array(end, start = 0, step = 1) {
  return { [Symbol.iterator]: range.bind(null, end, start, step) }
}

function names() {
  return [...array(90, 65), ...array(122, 97)].map(c => String.fromCharCode(c))
}

test('runs a few tasks together', async () => {
  let result = {}
  let batches = 0
  await parallelize([
    () => result.a = true,
    () => result.b = true
  ], set => {
    strictEqual(set.length, 2)
    ++batches
  }, 2)
  strictEqual(batches, 1)
  deepStrictEqual(result, { a: true, b: true })
})

test('runs many tasks in batches', async () => {
  const tasks = names()
  let result = {}
  let batches = 0
  await parallelize(
    tasks.map(task => () => result[task] = true),
    () => ++batches)
  ok(batches > 1)
  deepStrictEqual(result, tasks.reduce(
    (result, task) => { result[task] = true; return result }, {}))
})
