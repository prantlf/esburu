const { performTasks } = require('..')

const { argv } = process
let   args, config, depth, parallelism, parallelDefault, watch, verbose, debug

for (let i = 2, l = argv.length; i < l; ++i) {
  const arg = argv[i]
  if (arg === '--') {
    args = argv.slice(i + 1)
    break
  }
  const match = /^(-|--)(?:(no)-)?([-_a-zA-Z]+)$/.exec(arg)
  if (match) {
    const args = match[1] === '-' ? match[3].split('') : [match[3]]
    for (const arg of args) {
      switch (arg) {
        case 'c': case 'config':
          config = argv[++i]
          continue
        case 'D': case 'depth':
          depth = +argv[++i]
          if (!(depth >= 0)) {
            console.error(`depth not zero or greater: "${argv[i]}"`)
            process.exit(2)
          }
          continue
        case 'P': case 'parallelism':
          parallelism = +argv[++i]
          if (!(parallelism > 0)) {
            console.error(`parallelism not greater than zero: "${argv[i]}"`)
            process.exit(2)
          }
          continue
        case 'd': case 'debug':
          debug = match[1] !== 'no'
          continue
        case 'w': case 'watch':
          watch = match[1] !== 'no'
          continue
        case 'v': case 'verbose':
          verbose = match[1] !== 'no'
          continue
        case 'V': case 'version':
          console.log(require('../package.json').version)
          process.exit(0)
        case 'h': case 'help':
          require('./shared/help')()
          process.exit(0)
      }
      console.error(`unknown option: "${match[0]}"`)
      process.exit(2)
    }
    continue
  }
  console.error(`unknown argument: "${arg}"`)
  process.exit(2)
}

performTasks(config, { args, depth, parallelism, watch, verbose, debug })
  .catch(({ config, errors, message, stack }) => {
    if (config)
      console.error(stack)
    else if (!errors)
      console.error(verbose ? stack : `${message}; run "estar -h" for help`)
    process.exitCode = 1
  })
