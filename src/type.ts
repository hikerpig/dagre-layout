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

export interface GraphData extends GraphOpts {
  maxRank: number
}

export type EdgeOpts = {
  minlen: number
  labeloffset: number
  labelpos: 'l' | 'r' | 'c'
}

/**
 * Node data during layout
 */
export type DNode = {
  width: number
  height: number
  marginl?: number
  marginr?: number
  margint?: number
  marginb?: number

  rank?: number
  selfEdges: string[]
  minRank?: number
  maxRank?: number
  borderTop?: string // top dummy node id
  borderBottom?: string // bottom dummy node id
}

/**
 * Edge data
 */
export interface DEdge extends EdgeOpts {
  width: number
  height: number
}
