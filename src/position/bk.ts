import * as _ from '../util-lodash'
import { Graph } from '@pintora/graphlib'

import util from '../util'
import { DagreGraph, DNode } from 'src/type'

/*
 * This module provides coordinate assignment based on Brandes and Köpf, "Fast
 * and Simple Horizontal Coordinate Assignment."
 */

/*
 * Marks all edges in the graph with a type-1 conflict with the "type1Conflict"
 * property. A type-1 conflict is one where a non-inner segment crosses an
 * inner segment. An inner segment is an edge with both incident nodes marked
 * with the "dummy" property.
 *
 * This algorithm scans layer by layer, starting with the second, for type-1
 * conflicts between the current layer and the previous layer. For each layer
 * it scans the nodes from left to right until it reaches one that is incident
 * on an inner segment. It then scans predecessors to determine if they have
 * edges that cross that inner segment. At the end a final scan is done for all
 * nodes on the current rank to see if they cross the last visited inner
 * segment.
 *
 * This algorithm (safely) assumes that a dummy node will only be incident on a
 * single node in the layers being scanned.
 */
function findType1Conflicts(g: DagreGraph, layering: Layering) {
  const conflicts = {}

  function visitLayer(prevLayer: Layer, layer: Layer) {
    // last visited node in the previous layer that is incident on an inner
    // segment.
    let k0 = 0
    // Tracks the last node in this layer scanned for crossings with a type-1
    // segment.
    let scanPos = 0
    const prevLayerLength = prevLayer.length
    const lastNode = _.last(layer)

    _.forEach(layer, function (v, i: number) {
      if (!v) return
      const w = findOtherInnerSegmentNode(g, v)
      const k1 = w ? g.node(w).order : prevLayerLength

      if (w || v === lastNode) {
        _.forEach(layer.slice(scanPos, i + 1), function (scanNode) {
          _.forEach(g.predecessors(scanNode), function (u) {
            const uLabel = g.node(u)
            const uPos = uLabel.order
            if (
              (uPos < k0 || k1 < uPos) &&
              !(uLabel.dummy && g.node(scanNode).dummy)
            ) {
              addConflict(conflicts, u, scanNode)
            }
          })
        })
        scanPos = i + 1
        k0 = k1
      }
    })

    return layer
  }

  _.reduce(layering, visitLayer)
  return conflicts
}

function findType2Conflicts(g: DagreGraph, layering) {
  const conflicts = {}

  function scan(south, southPos, southEnd, prevNorthBorder, nextNorthBorder) {
    let v
    _.forEach(_.range(southPos, southEnd), function (i) {
      v = south[i]
      if (!v) return
      if (g.node(v).dummy) {
        _.forEach(g.predecessors(v), function (u) {
          const uNode = g.node(u)
          if (
            uNode.dummy &&
            (uNode.order < prevNorthBorder || uNode.order > nextNorthBorder)
          ) {
            addConflict(conflicts, u, v)
          }
        })
      }
    })
  }

  function visitLayer(north: string[], south: string[]) {
    let prevNorthPos = -1
    let nextNorthPos: number
    let southPos = 0

    _.forEach(south, function (v, southLookahead: number) {
      if (!v) return
      if (g.node(v).dummy === 'border') {
        const predecessors = g.predecessors(v)
        if (predecessors.length) {
          nextNorthPos = g.node(predecessors[0]).order
          scan(south, southPos, southLookahead, prevNorthPos, nextNorthPos)
          southPos = southLookahead
          prevNorthPos = nextNorthPos
        }
      }
      scan(south, southPos, south.length, nextNorthPos, north.length)
    })

    return south
  }

  _.reduce(layering, visitLayer)
  return conflicts
}

function findOtherInnerSegmentNode(g, v): string {
  if (g.node(v).dummy) {
    return _.find(g.predecessors(v), function (u) {
      return g.node(u).dummy
    })
  }
}

function addConflict(conflicts, v, w) {
  if (v > w) {
    const tmp = v
    v = w
    w = tmp
  }

  let conflictsV = conflicts[v]
  if (!conflictsV) {
    conflicts[v] = conflictsV = {}
  }
  conflictsV[w] = true
}

function hasConflict(conflicts, v, w) {
  if (v > w) {
    const tmp = v
    v = w
    w = tmp
  }
  return _.has(conflicts[v], w)
}

/*
 * Try to align nodes into vertical "blocks" where possible. This algorithm
 * attempts to align a node with one of its median neighbors. If the edge
 * connecting a neighbor is a type-1 conflict then we ignore that possibility.
 * If a previous node has already formed a block with a node after the node
 * we're trying to form a block with, we also ignore that possibility - our
 * blocks would be split in that scenario.
 */
function verticalAlignment(g: DagreGraph, layering: Layering, conflicts, neighborFn: (arg0: string) => any) {
  const root: Record<string, string> = {}
  const align: Record<string, string> = {}
  const pos: Record<string, number> = {}

  // We cache the position here based on the layering because the graph and
  // layering may be out of sync. The layering matrix is manipulated to
  // generate different extreme alignments.
  _.forEach(layering, function (layer) {
    _.forEach(layer, function (v, order) {
      root[v] = v
      align[v] = v
      pos[v] = order
    })
  })

  _.forEach(layering, function (layer) {
    let prevIdx = -1
    _.forEach(layer, function (v) {
      if (!v) return
      let ws = neighborFn(v)
      if (ws.length) {
        ws = _.sortBy(ws, function (w) {
          return pos[w]
        })
        const mp = (ws.length - 1) / 2
        for (let i = Math.floor(mp), il = Math.ceil(mp); i <= il; ++i) {
          const w = ws[i]
          if (
            align[v] === v &&
            prevIdx < pos[w] &&
            !hasConflict(conflicts, v, w)
          ) {
            align[w] = v
            align[v] = root[v] = root[w]
            prevIdx = pos[w]
          }
        }
      }
    })
  })

  return { root: root, align: align }
}

function horizontalCompaction(g: DagreGraph, layering: Layering, root: Record<string, string>, alignMap: Record<string, string>, reverseSep: boolean) {
  // This portion of the algorithm differs from BK due to a number of problems.
  // Instead of their algorithm we construct a new block graph and do two
  // sweeps. The first sweep places blocks with the smallest possible
  // coordinates. The second sweep removes unused space by moving blocks to the
  // greatest coordinates without violating separation.
  const xs: Record<string, number> = {}
  const blockG = buildBlockGraph(g, layering, root, reverseSep)

  // First pass, assign smallest coordinates via DFS
  const visited = {}
  function pass1(v: string) {
    if (!_.has(visited, v)) {
      visited[v] = true
      xs[v] = _.reduce(
        blockG.inEdges(v) || [],
        function (max, e) {
          pass1(e.v)
          return Math.max(max, xs[e.v] + blockG.edge(e))
        },
        0
      )
    }
  }
  _.forEach(blockG.nodes(), pass1)

  const borderType = reverseSep ? 'borderLeft' : 'borderRight'
  function pass2(v: string) {
    if (visited[v] !== 2) {
      visited[v]++
      const node = g.node(v)
      const min = _.reduce(
        blockG.outEdges(v) || [],
        (min, e) => {
          pass2(e.w)
          return Math.min(min, xs[e.w] - blockG.edge(e))
        },
        Number.POSITIVE_INFINITY
      )
      if (min !== Number.POSITIVE_INFINITY && node.borderType !== borderType) {
        xs[v] = Math.max(xs[v], min)
      }
    }
  }
  _.forEach(blockG.nodes(), pass2)

  // Assign x coordinates to all nodes
  _.forEach(alignMap, function (v) {
    xs[v] = xs[root[v]]
  })

  return xs
}

function buildBlockGraph(g: DagreGraph, layering: Layering, root: { [x: string]: any }, reverseSep: boolean) {
  const blockGraph = new Graph<string, number>()
  const graphLabel = g.graph()
  const sepFn = makeSepFn(graphLabel.nodesep, graphLabel.edgesep, reverseSep)

  // console.log('[buildBlockGraph] layering', layering)
  // console.log('[buildBlockGraph], g', g)
  _.forEach(layering, function (layer) {
    let u: string
    _.forEach(layer, function (v) {
      const vRoot = root[v]
      blockGraph.setNode(vRoot)
      if (u) {
        const uRoot = root[u]
        const prevMax = blockGraph.edge(uRoot, vRoot)
        blockGraph.setEdge(uRoot, vRoot, Math.max(sepFn(g, v, u), prevMax || 0))
      }
      u = v
    })
  })

  return blockGraph
}

/*
 * Returns the alignment that has the smallest width of the given alignments.
 */
function findSmallestWidthAlignment(g: DagreGraph, xss: XSegs) {
  type Pair = [string, number]
  return _.minBy(_.values(xss), function (xs) {
    const min = (_.minBy<Pair>(
      _.toPairs(xs),
      (pair: Pair) => pair[1] - width(g, pair[0]) / 2
    ) || ['k', 0])[1]
    const max: number = (_.maxBy<Pair>(
      _.toPairs(xs),
      (pair: Pair) => pair[1] + width(g, pair[0]) / 2
    ) || ['k', 0])[1]
    return max - min
  })
}

/*
 * Align the coordinates of each of the layout alignments such that
 * left-biased alignments have their minimum coordinate at the same point as
 * the minimum coordinate of the smallest width alignment and right-biased
 * alignments have their maximum coordinate at the same point as the maximum
 * coordinate of the smallest width alignment.
 */
function alignCoordinates(xss: XSegs, alignTo: Record<string, number>) {
  const alignToVals = _.values(alignTo)
  const alignToMin = _.min(alignToVals)
  const alignToMax = _.max(alignToVals)

  _.forEach(['u', 'd'], function (vert) {
    _.forEach(['l', 'r'], function (horiz) {
      const alignment = vert + horiz
      const xs = xss[alignment]
      if (xs === alignTo) {
        return
      }
      const xsVals = _.values(xs)
      const delta =
        horiz === 'l' ? alignToMin - _.min(xsVals) : alignToMax - _.max(xsVals)
      if (delta) {
        xss[alignment] = _.mapValues(xs, function (x) {
          return x + delta
        })
      }
    })
  })
}

function balance(xss: XSegs, align: string): {[key: string]: number} {
  return _.mapValues(xss.ul, function (ignore, v) {
    if (align) {
      return xss[align.toLowerCase()][v]
    } else {
      const xs = _.sortBy(_.map(xss, v))
      // if no align is specified, use median value (there are 4 vertices, get value between second and the third)
      return (xs[1] + xs[2]) / 2
    }
  })
}

type Layer = string[]
type Layering = Layer[]

type XSSKey = 'ul' | 'ur' | 'dl' | 'dr'

type XSegs = Record<XSSKey, Record<string, number>>

export function positionX(g: DagreGraph) {
  const layering = util.buildLayerMatrix(g)
  const conflicts = Object.assign(
    findType1Conflicts(g, layering),
    findType2Conflicts(g, layering)
  )
  const xss: XSegs = {} as any
  let adjustedLayering: Layering
  _.forEach(['u', 'd'], function (vert) {
    adjustedLayering = vert === 'u' ? layering : _.values(layering).reverse()
    _.forEach(['l', 'r'], function (horiz) {
      if (horiz === 'r') {
        adjustedLayering = _.map(adjustedLayering, function (inner) {
          return _.values(inner).reverse()
        })
      }

      const neighborFn = (vert === 'u' ? g.predecessors : g.successors).bind(g)
      const verticalAlign = verticalAlignment(
        g,
        adjustedLayering,
        conflicts,
        neighborFn
      )
      let xs = horizontalCompaction(
        g,
        adjustedLayering,
        verticalAlign.root,
        verticalAlign.align,
        horiz === 'r'
      )
      if (horiz === 'r') {
        xs = _.mapValues(xs, function (x) {
          return -x
        })
      }
      xss[vert + horiz] = xs
    })
  })
  // console.log('xss', xss)

  const smallestWidth = findSmallestWidthAlignment(g, xss)
  alignCoordinates(xss, smallestWidth)
  return balance(xss, g.graph().align)
}

function makeSepFn(nodeSep: number, edgeSep: number, reverseSep: boolean) {
  return function (g: DagreGraph, v: string, w: string) {
    const vLabel: DNode = g.node(v)
    const wLabel: DNode = g.node(w)
    if (!(vLabel && wLabel)) return 0
    let sum = 0
    let delta: number

    sum += (vLabel.marginr || 0)

    sum += getNodeWidth(vLabel) / 2
    if (_.has(vLabel, 'labelpos')) {
      switch (vLabel.labelpos.toLowerCase()) {
        case 'l':
          delta = -getNodeWidth(vLabel) / 2
          break
        case 'r':
          delta = getNodeWidth(vLabel) / 2
          break
      }
    }
    if (delta) {
      sum += reverseSep ? delta : -delta
    }
    delta = 0

    sum += (vLabel.dummy ? edgeSep : nodeSep) / 2
    sum += (wLabel.dummy ? edgeSep : nodeSep) / 2

    sum += (wLabel.marginl || 0)
    // console.log('v w margin', vLabel.marginl, wLabel.marginl)

    sum += getNodeWidth(wLabel) / 2
    if (_.has(wLabel, 'labelpos')) {
      switch (wLabel.labelpos.toLowerCase()) {
        case 'l':
          delta = getNodeWidth(wLabel) / 2
          break
        case 'r':
          delta = -getNodeWidth(wLabel) / 2
          break
      }
    }
    if (delta) {
      sum += reverseSep ? delta : -delta
    }
    delta = 0

    return sum
  }
}

function getNodeWidth(node: DNode) {
  if (!node) return 0
  return Math.max(node.minwidth || 0, node.width)
}

function width(g: DagreGraph, v: string): number {
  const node = g.node(v)
  return getNodeWidth(node)
}

export default {
  positionX: positionX,
  findType1Conflicts: findType1Conflicts,
  findType2Conflicts: findType2Conflicts,
  addConflict: addConflict,
  hasConflict: hasConflict,
  verticalAlignment: verticalAlignment,
  horizontalCompaction: horizontalCompaction,
  alignCoordinates: alignCoordinates,
  findSmallestWidthAlignment: findSmallestWidthAlignment,
  balance: balance,
}
