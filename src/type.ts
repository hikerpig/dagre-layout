export type Entry = {
  indegree: number
  in: Entry[]
  out: Entry[]
  vs: string[]
  i: number
  v?: string
  barycenter?: number
  weight?: number
}

export type Barycenter = Pick<Entry, 'v' | 'barycenter' | 'weight'>

export type GraphOpts = Partial<{
  nodesep: number
  edgesep: number
  ranksep: number
  marginx: number
  marginy: number
  rankdir: string
  acyclicer: string
  ranker: string
  align: string
}>

export type EdgeOpts = {
  minlen: number
  labeloffset: number
  labelpos: 'l' | 'r' | 'c'
}
