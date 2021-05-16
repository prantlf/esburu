const debug = require('debug')

const log = debug('esburu')

/* c8 ignore next */
const enableLog = () => debug.enable('esburu')

const formatTask = task => {
  const { entryPoints, outfile, outdir } = task
  return { in: entryPoints, out: outfile || outdir }
}

module.exports = { log, enableLog, formatTask }
