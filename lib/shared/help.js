module.exports = function help() {
  console.log(`Runs esbuild tasks from a configuration file.

Usage: esburu [option ...] [-- arg ...]

Options:
  -c|--config <file>          load the configuration from an alternative file
  -D|--depth <number>         maximum directory depth to look for the config
  -e|--esbuild <name>         alternative name of the esbuild module
  -P|--parallelism <count>    maximum count of tasks running in parallel
  -p|--[no-]parallel-default  execute task sequences in parallel by default
  -w|--[no-]watch             stay running and watch for source file changes
  -v|--[no-]verbose           increase verbosity of the console output
  -d|--[no-]debug             enable debugging output on stderr
  -V|--version                print the version number and exit
  -h|--help                   print usage instructions and exit

If no config file is provided, "esburu.config.js" will be loaded by default.
The file will be looked for in the current directory and then in the
ancestors. The maximum depth is 10 by default. The current directory will
be switched to the location of the config file. The default parallelism is
the count of CPUs. Command-line arguments past "--" will be ignored.

Examples:
  esburu -pw
  esburu -c esburu.test.js`)
}
