const test = require('tehanu')('util')
const { deepStrictEqual } = require('assert')
const { getOpts, setOpts } = require('../lib/util')

test('setOpts merges non-boolean default values', () => {
  setOpts({ test: true })
  deepStrictEqual(getOpts(), { args: [], depth: 10, test: true })
})

test('setOpts does not replace defaults with undefined', () => {
  setOpts({ args: undefined })
  deepStrictEqual(getOpts(), { args: [], depth: 10 })
})
