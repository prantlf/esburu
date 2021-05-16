const test = require('tehanu')('help')
const { strictEqual } = require('assert')
const help = require('../lib/shared/help')

test('prints usage instructions', () => {
  const { log } = console
  let   message
  console.log = value => message = value
  help()
  console.log = log
  strictEqual(typeof message, 'string')
})
