## ESBuild Task Runner

[![NPM version](https://badge.fury.io/js/esburu.png)](http://badge.fury.io/js/esburu)
[![Build Status](https://github.com/prantlf/esburu/workflows/Test/badge.svg)](https://github.com/prantlf/esburu/actions)
[![Dependency Status](https://david-dm.org/prantlf/esburu.svg)](https://david-dm.org/prantlf/esburu)
[![devDependency Status](https://david-dm.org/prantlf/esburu/dev-status.svg)](https://david-dm.org/prantlf/esburu#info=devDependencies)

Runs [esbuild] tasks from a configuration file. Reduces the command-line and configuration duplication in projects with multile build targets. Supports parallel execution.

## Synopsis

Let us assume the following project structure with two components and their tests:

    src/
    ├── first
    │   ├── first.md
    │   ├── first.ts
    │   └── first.test.ts
    └── second
        ├── second.md
        ├── second.ts
        └── second.test.ts

With the output files created in the following locations:

    dist/
    ├── first.js
    └── second.js

    src/
    ├── first
    │   └── first.test.js
    └── second
        └── second.test.js

The build script usually contains commands for building each component and each test:

    esbuild --bundle --outfile=dist/first.js src/first/first.ts
    esbuild --bundle --outfile=dist/second.js src/second/second.ts
    esbuild --bundle --outfile=src/first/first.test.js src/first/first.test.ts
    esbuild --bundle --outfile=src/second/second.test.js src/second/second.test.ts

The sequence of commands with options for building components and their tests, which is difficult to maintain in `scripts` in `package.json`, can be simplified by creating `esburu.config.js`, which will be processed just by executing `esburu`:

```js
modules.exports = [
  {
    entryPoints: ['src/[name]/[name].ts'],
    outfile: 'dist/[name].js',
    bundle: true
  },
  {
    entryPoints: ['src/[name]/[name].test.ts'],
    outfile: 'src/[name]/[name].test.js',
    bundle: true
  }
]
```

## Installation

You can install this package using your favourite Node.js package manager, including the peer dependency on [esbuild]:

```sh
npm i -D esburu esbuild
yarn add -D esburu esbuild
pnpm i -D esburu esbuild
```

## Usage

Run esbuild tasks from a configuration file:

    esburu [option ...] [-- arg ...]

### Options

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

Command-line arguments past `--` will be ignored.

### Examples

    esburu -pw
    esburu -c esburu.test.js

### Configuration

If no config file is provided, `esburu.config.js` will be looked for by default.
If not found in the current directory, the search will continue to its ancestors with the default maximum depth of 10 directories.

Before the tasks get executed the current directory of the build process will
be switched to the location of the config file, so that the file paths in the config file can be relative to it, regardless in what directory was `esburu` started.

All [simple] and [advanced] options of [esbuild] can be used in a task object.

```js
modules.exports = [
  {
    entryPoints: ['src/index.ts'],
    outfile: 'dist/index.js',
    bundle: true
  }
]
```

Only [`entryPoints` property] with a single source file is supported. The path expansion will not take place if there are more entry points in a task. The name placeholders from the [`entryPoints` property] are replaced with `*` and looked for in the local file system. One build task will be added for each matched file. Placeholders in the [`outfile` property] or the [`outdir` property] will be replaced with the values from the [`entryPoints` property].

```js
modules.exports = [
  {
    entryPoints: ['src/[name].ts'],
    outfile: 'dist/[name].js',
    bundle: true
  }
]
```

## Parallelism

If you pass the build tasks in an object `{ parallel, tasks }` instead of an array, they will be executed in parallel instead of sequentially:

```js
modules.exports = {
  parallel: true,
  tasks: [
    {
      entryPoints: ['src/index.ts'],
      outfile: 'dist/index.js',
      bundle: true
    },
    {
      entryPoints: ['src/index.ts'],
      outfile: 'dist/index.min.js',
      bundle: true, minify: true
    }
  ]
}
```

You can nest sequential and parallel lists of build tasks too. An array of tasks or an object `{ parallel, tasks }` can be used instead of a build task object on any level:

```js
modules.exports = [
  {
    parallel: true,
    tasks: [
      {
        entryPoints: ['src/index.ts'],
        outfile: 'dist/index.js',
        bundle: true
      },
      {
        entryPoints: ['src/index.ts'],
        outfile: 'dist/index.min.js',
        bundle: true
      }
    ]
  },
  {
    parallel: true,
    tasks: [{
      entryPoints: ['test/index.ts'],
      outfile: 'test/index.js',
      bundle: true
    }]
  }
]
```

You can switch the execution of task sequences to be parallel by default using the option `-p` (`--parallel-default`):

```js
// Run with `esburu -p`
modules.exports = [
  {
    entryPoints: ['src/index.ts'],
    outfile: 'dist/index.js',
    bundle: true
  },
  {
    entryPoints: ['src/index.ts'],
    outfile: 'dist/index.min.js',
    bundle: true, minify: true
  }
]
```

Build tasks added by expanding the file path placeholders will be also executed in parallel if you wrap them as single object in an array, as a shorter-syntax alternative to `{ parallel, tasks }`:

```js
modules.exports = [
  {
    entryPoints: ['src/index.ts'],
    outfile: 'dist/index.js',
    bundle: true
  },
  [{ // all src/comp/*.ts will be built in parallel
    entryPoints: ['src/comp/[name].ts'],
    outfile: 'dist/[name].js',
    bundle: true, minify: true
  }]
]
```

The automatic parallelisation can be suppressed by setting the `parallelDefault` option to `false` explicitly (`-no-p`, `--no-parallel-default`). If the default parallelisation needs to be applied globally, only not affecting selected tasks, you can enforce the sequential execution for a specific task list:

```js
modules.exports = {
  parallel: false,
  tasks: [
    {
      entryPoints: ['src/index.ts'],
      outfile: 'dist/index.js',
      bundle: true
    },
    {
      entryPoints: ['test/index.ts'],
      outfile: 'test/index.js',
      bundle: true
    }
  ]
}
```

The default task execution parallelism is set to the count of CPUs, [as reported by Node.js](https://nodejs.org/api/os.html#os_os_cpus).

## Arguments

The configuration file can access command-line arguments passed to the `esburu` process. The arguments after "--" are ignored by the build execution, and they can be used in the build configuration module for conditional behaviour.

For example, a standard parameter "watch" and a custom one "test" can be added to the command line:

    esburu --watch -- test

And its presence can be checked in the build configuration module:

```js
const { getOpts } = require('esburu/lib/util')

const { watch, args } = getOpts()
const test = args.includes('test')

modules.exports = { ... }
```

## API

The build can be started programmatically too:

```js
const { performTasks } = require('esburu')

const tasks = [
  {
    entryPoints: ['src/[name]/[name].ts'],
    outfile: 'dist/[name].js',
    bundle: true
  }
]

performTasks(tasks, { parallelDefault: true })
  .catch(({ config, errors, message, stack }) => {
    if (config) // loading the configuration failed in JS parsing
      console.error(stack)
    else if (!errors) // esbuild itself prints errors on the console
      console.error(message)
    process.exitCode = 1
  })
```

### performTasks(config?: string | object, opts?: object): Promise

Preforms a complete build using either a configuration file path or an object with the build configuration from the `config` argument. The `opts` argument supports all [parameters recognised by the command-line tool](#options).

Do not run more builds in a single process. Once the [esbuild] module is loaded, it stays set to the same working directory. You would not be able to use paths relative to the directory of the configuration file in those files, if those files are located in different directories.

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Lint and test your code using `npm test`.

## License

Copyright (c) 2021 Ferdinand Prantl

Licensed under the MIT license.

[esbuild]: https://esbuild.github.io/
[`entryPoints` property]: https://esbuild.github.io/api/#entry-points
[`outfile` property]: https://esbuild.github.io/api/#outfile
[`outdir` property]: https://esbuild.github.io/api/#outdir
[simple]: https://esbuild.github.io/api/#simple-options
[advanced]: https://esbuild.github.io/api/#advanced-options
