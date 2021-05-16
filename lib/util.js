let opts = []

function getOpts () {
  return opts
}

function setOpts (value = {}) {
  opts = { ...value }
  if (opts.args === undefined) opts.args = []
  if (opts.depth === undefined) opts.depth = 10
}

module.exports = { getOpts, setOpts }
