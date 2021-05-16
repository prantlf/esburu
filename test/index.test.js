const test = require('tehanu')('index')
const { ok, strictEqual } = require('assert')
const exported = require('..')

test('exports functions', async () => {
  ok(exported && typeof exported === 'object')
  strictEqual(Object.keys(exported).length, 7)
  const {
    enableLog, setOpts, findTasks, loadTasks, expandTasks, runTasks, performTasks
  } = exported
  ok(enableLog)
  ok(setOpts)
  ok(findTasks)
  ok(loadTasks)
  ok(expandTasks)
  ok(runTasks)
  ok(performTasks)
})
