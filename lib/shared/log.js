const debug = require('debug')

const log = debug('estar')

/* c8 ignore next */
const enableLog = () => debug.enable('estar')

const formatTask = task => {
  const { entryPoints, outfile, outdir } = task
  return { in: entryPoints, out: outfile || outdir }
}

module.exports = { log, enableLog, formatTask }
