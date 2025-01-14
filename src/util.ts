import * as _ from './util-lodash'
import { Graph } from '@pintora/graphlib'
import { DagreGraph, DNode, Rect, Point, NodeDummyType } from './type'

export { Graph }

/*
 * Adds a dummy node to the graph and return v.
 */
export function addDummyNode(g: DagreGraph, type: NodeDummyType, attrs: Partial<DNode>, name: string) {
  let v: string
  do {
    v = _.uniqueId(name)
  } while (g.hasNode(v))

  attrs.dummy = type
  g.setNode(v, attrs as DNode)
  return v
}

/*
 * Returns a new graph with only simple edges. Handles aggregation of data
 * associated with multi-edges.
 */
export function simplify(g: DagreGraph) {
  const simplified = new Graph().setGraph(g.graph())
  _.forEach(g.nodes(), function (v) {
    simplified.setNode(v, g.node(v))
  })
  _.forEach(g.edges(), function (e) {
    const simpleLabel = simplified.edge(e.v, e.w) || { weight: 0, minlen: 1 }
    const label = g.edge(e)
    simplified.setEdge(e.v, e.w, {
      weight: simpleLabel.weight + label.weight,
      minlen: Math.max(simpleLabel.minlen, label.minlen),
    })
  })
  return simplified
}

export function asNonCompoundGraph(g: DagreGraph) {
  const simplified = new Graph({ multigraph: g.isMultigraph() }).setGraph(
    g.graph()
  )
  _.forEach(g.nodes(), function (v) {
    if (!g.children(v).length) {
      simplified.setNode(v, g.node(v))
    }
  })
  _.forEach(g.edges(), function (e) {
    simplified.setEdge(e, g.edge(e))
  })
  return simplified
}

export function successorWeights(g: DagreGraph) {
  const weightMap = _.map(g.nodes(), function (v) {
    const sucs = {}
    _.forEach(g.outEdges(v), function (e) {
      sucs[e.w] = (sucs[e.w] || 0) + g.edge(e).weight
    })
    return sucs
  })
  return _.zipObject(g.nodes(), weightMap)
}

export function predecessorWeights(g) {
  const weightMap = _.map(g.nodes(), function (v) {
    const preds = {}
    _.forEach(g.inEdges(v), function (e) {
      preds[e.v] = (preds[e.v] || 0) + g.edge(e).weight
    })
    return preds
  })
  return _.zipObject(g.nodes(), weightMap)
}

/*
 * Finds where a line starting at point ({x, y}) would intersect a rectangle
 * ({x, y, width, height}) if it were pointing at the rectangle's center.
 */
export function intersectRect(rect: Rect, point: Point): Point {
  const x = rect.x
  const y = rect.y

  // Rectangle intersection algorithm from:
  // http://math.stackexchange.com/questions/108113/find-edge-between-two-boxes
  const dx = point.x - x
  const dy = point.y - y
  let w = rect.width / 2
  let h = rect.height / 2

  if (!dx && !dy) {
    throw new Error('Not possible to find intersection inside of the rectangle')
  }

  let sx
  let sy
  if (Math.abs(dy) * w > Math.abs(dx) * h) {
    // Intersection is top or bottom of rect.
    if (dy < 0) {
      h = -h
    }
    sx = (h * dx) / dy
    sy = h
  } else {
    // Intersection is left or right of rect.
    if (dx < 0) {
      w = -w
    }
    sx = w
    sy = (w * dy) / dx
  }

  return { x: x + sx, y: y + sy }
}

/*
 * Given a DAG with each node assigned "rank" and "order" properties, this
 * function will produce a matrix with the ids of each node.
 */
export function buildLayerMatrix(g: DagreGraph): Array<string[]> {
  const layering = _.map(_.range(maxRank(g) + 1), function () {
    return []
  })
  _.forEach(g.nodes(), function (v) {
    const node = g.node(v)
    const rank = node.rank
    if (!_.isUndefined(rank) && typeof node.order === 'number') {
      layering[rank][node.order] = v
    }
  })
  return layering
}

/*
 * Adjusts the ranks for all nodes in the graph such that all nodes v have
 * rank(v) >= 0 and at least one node w has rank(w) = 0.
 */
export function normalizeRanks(g) {
  const min = _.min(
    _.map(g.nodes(), function (v) {
      return g.node(v).rank
    })
  )
  _.forEach(g.nodes(), function (v) {
    const node = g.node(v)
    if (_.has(node, 'rank')) {
      node.rank -= min
    }
  })
}

export function removeEmptyRanks(g: DagreGraph) {
  // Ranks may not start at 0, so we need to offset them
  const offset = _.min(
    _.map(g.nodes(), function (v) {
      return g.node(v).rank
    })
  )

  const layers = []
  _.forEach(g.nodes(), function (v) {
    const rank = g.node(v).rank - offset
    if (!layers[rank]) {
      layers[rank] = []
    }
    layers[rank].push(v)
  })

  let delta = 0
  const nodeRankFactor = g.graph().nodeRankFactor
  _.forEach(layers, function (vs, i) {
    if (_.isUndefined(vs) && i % nodeRankFactor !== 0) {
      --delta
    } else if (delta) {
      _.forEach(vs, function (v) {
        g.node(v).rank += delta
      })
    }
  })
}

type Node = {
  width: number
  height: number
  rank?: number
  order?: number
}

export function addBorderNode(g, prefix, rank?: number, order?: number) {
  const node: Node = {
    width: 0,
    height: 0,
  }
  if (arguments.length >= 4) {
    node.rank = rank
    node.order = order
  }
  return addDummyNode(g, 'border', node, prefix)
}

export function maxRank(g: DagreGraph) {
  return _.max(
    _.map(g.nodes(), function (v) {
      const rank = g.node(v).rank
      if (!_.isUndefined(rank)) {
        return rank
      }
    })
  )
}

/*
 * Partition a collection into two groups: `lhs` and `rhs`. If the supplied
 * function returns true for an entry it goes into `lhs`. Otherwise it goes
 * into `rhs.
 */
export function partition(collection, fn) {
  const result = { lhs: [], rhs: [] }
  _.forEach(collection, function (value) {
    if (fn(value)) {
      result.lhs.push(value)
    } else {
      result.rhs.push(value)
    }
  })
  return result
}

/*
 * Returns a new function that wraps `fn` with a timer. The wrapper logs the
 * time it takes to execute the function.
 */
export function time(name, fn) {
  const start = Date.now()
  try {
    return fn()
  } finally {
    console.log(name + ' time: ' + (Date.now() - start) + 'ms')
  }
}

export function notime(name, fn) {
  return fn()
}

/**
 * compare two objects relative position, maybe rects or points
 */
export function comparePositions<T extends Point>(p1: T, p2: T) {
  const isXEqual = p1.x === p2.x
  const isYEqual = p1.y === p2.y

  const leftOne = p2.x < p1.x ? p2 : p1
  const topOne = p2.y < p1.y ? p2 : p1
  const rightOne = p1 === leftOne ? p2 : p1
  const bottomOne = p1 === topOne ? p2 : p1

  const dx = rightOne.x - leftOne.x
  const dy = bottomOne.y - topOne.y

  return {
    isXEqual,
    isYEqual,
    leftOne,
    rightOne,
    topOne,
    bottomOne,
    dx,
    dy,
  }
}

export type RangeTupple = [number, number]

export function isInsideRange(v: number, range: RangeTupple) {
  const [start, end] = range
  if (v >= start && v <= end) return true
  return false
}

export function getNum(v: number, defaultValue = 0) {
  return v || defaultValue
}

export function isNumber(v: unknown): v is number {
  return typeof v === 'number' && !isNaN(v)
}

export default {
  addDummyNode,
  simplify,
  asNonCompoundGraph,
  successorWeights,
  predecessorWeights,
  intersectRect,
  buildLayerMatrix,
  normalizeRanks,
  removeEmptyRanks,
  addBorderNode,
  maxRank,
  partition,
  time,
  notime,
}
