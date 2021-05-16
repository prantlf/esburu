declare type Tasks = object | object[]

interface SetOpts {
  args?: string[]
  watch?: boolean
  verbose?: boolean
}

interface RunOpts {
  esbuild?: string
  parallelism?: integer
  parallelDefault?: boolean
  watch?: boolean
  verbose?: boolean
}

interface PerformOpts extends RunOpts {
  args?: string[]
  depth?: integer
  debug?: boolean
}

export function enableLog(): void
export function setOpts(opts: SetOpts): void
export function findTasks(path: string, depth?: integer): Promise<string>
export function loadTasks(path: string): Promise<Tasks>
export function expandTasks(config: Tasks, opts?: RunOpts): Promise<Tasks>
export function runTasks(config: Tasks, opts?: RunOpts): Promise<void>
export function performTasks(config: string | object, opts?: PerformOpts): Promise<void>
