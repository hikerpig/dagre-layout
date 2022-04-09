import { Graph } from '@pintora/graphlib'

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

export type DagreGraph = Graph<DNode, DEdge, GraphData>

export type SplinesType = 'polyline' | 'ortho'

/**
 * Options on graph
 */
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
  /**
   * How edge splines are represented
   * - 'polyline' by default
   * - 'ortho' orthogonal edges are axis-aligned and bendings are right-angled
   */
  splines: SplinesType
  /**
   * Sometimes - like using orthogonal layout - we should avoid edges sitting on the border
   */
  avoid_label_on_border: boolean
}>

/**
 * Graph data during layout
 */
export interface GraphData extends GraphOpts {
  maxRank: number
  dummyChains: string[]
  width: number
  height: number
  nodeRankFactor?: number
  borderRanks?: Set<number>
  /** see nesting-graph.ts */
  nestingRoot?: string
}

export type EdgeOpts = {
  label: string
  /** min lengh - span how many ranks - of edge */
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
  /** assign to a compound node */
  minwidth?: number
}

export type NodeDummyType =
  | 'root'
  | 'edge'
  | 'edge-label'
  | 'edge-proxy'
  | 'border'
  | 'selfedge'

export type SelfEdge = {
  e: any
  label: DEdge
}

/**
 * Node data during layout
 */
export interface DNode extends NodeOpts {
  rank?: number
  selfEdges?: SelfEdge[]
  minRank?: number
  maxRank?: number
  borderTop?: string // top dummy node id
  borderBottom?: string // bottom dummy node id
  borderLeft?: string[]
  borderRight?: string[]
  order: number
  edgeLabel?: DEdge
  edgeObj?: any
  dummy?: NodeDummyType
  borderType?: string
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
  points: Point[]
  labelRank: number
  weight: number
  /** position for the label */
  labelPoint?: Point
  x?: number
  y?: number
  reversed?: boolean
  nestingEdge?: boolean
}

export type Rect = { x: number; y: number; width: number; height: number }

export type Point = { x: number; y: number }
