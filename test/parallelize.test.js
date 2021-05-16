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
  let results = {}
  let batches = 0
  await parallelize([
    () => results.a = true,
    () => results.b = true
  ], set => {
    strictEqual(set.length, 2)
    ++batches
  }, 2)
  strictEqual(batches, 1)
  deepStrictEqual(results, { a: true, b: true })
})

test('runs many tasks in batches', async () => {
  const tasks = names()
  let results = {}
  let batches = 0
  await parallelize(
    tasks.map(task => () => results[task] = true),
    () => ++batches)
  ok(batches > 1)
  deepStrictEqual(results, tasks.reduce(
    (result, task) => { result[task] = true; return result }, {}))
})
