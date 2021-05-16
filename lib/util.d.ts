interface Opts {
  args?: string[]
  watch?: boolean
  verbose?: boolean
}

export function getOpts(): Opts
export function setOpts(opts: Opts): void
