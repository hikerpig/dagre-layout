import { Edge } from "@pintora/graphlib"

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

/**
 * Graph data during layout
 */
export interface GraphData extends GraphOpts {
  maxRank: number
  dummyChains: string[]
  width: number
  height: number
}

export type EdgeOpts = {
  label: string
  minlen: number
  labeloffset: number
  labelpos: 'l' | 'r' | 'c'
}

export type NodeOpts = {
  width: number
  height: number
  marginl?: number
  marginr?: number
  margint?: number
  marginb?: number
}


/**
 * Node data during layout
 */
export interface DNode extends NodeOpts {
  rank?: number
  selfEdges?: any[]
  minRank?: number
  maxRank?: number
  borderTop?: string // top dummy node id
  borderBottom?: string // bottom dummy node id
  borderLeft?: string[]
  borderRight?: string[]
  order: number
  edgeLabel?: DEdge
  edgeObj?: any
  dummy?: string
  x: number
  y: number
  label: DEdge
  e?: any
  labelpos: 'l' | 'r' | 'c'
}

/**
 * Edge data
 */
export interface DEdge extends EdgeOpts {
  width: number
  height: number
  points: any[]
  x?: number
  y?: number
}
