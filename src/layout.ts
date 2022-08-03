import * as _ from './util-lodash'
import { Graph } from '@pintora/graphlib'

import acyclic from './acyclic'
import normalize from './normalize'
import rank from './rank'
import util, {
  normalizeRanks,
  removeEmptyRanks,
  comparePositions,
  isInsideRange,
  RangeTupple,
} from './util'
import parentDummyChains from './parent-dummy-chains'
import nestingGraph from './nesting-graph'
import addBorderSegments from './add-border-segments'
import coordinateSystem from './coordinate-system'
import order from './order'
import position from './position'
import {
  DEdge,
  DNode,
  GraphData,
  NodeOpts,
  DagreGraph,
  Point,
  GraphOpts,
  EdgeOpts,
} from './type'

function layout(g, opts?: { debugTiming?: boolean }) {
  const time = opts && opts.debugTiming ? util.time : util.notime
  time('layout', function () {
    const layoutGraph = time('  buildLayoutGraph', function () {
      return buildLayoutGraph(g)
    })
    time('  runLayout', function () {
      runLayout(layoutGraph, time)
    })
    time('  updateInputGraph', function () {
      updateInputGraph(g, layoutGraph)
    })
  })
}

function runLayout(g: DagreGraph, time) {
  time('    makeSpaceForEdgeLabels', function () {
    makeSpaceForEdgeLabels(g)
  })
  time('    removeSelfEdges', function () {
    removeSelfEdges(g)
  })
  time('    acyclic', function () {
    acyclic.run(g)
  })
  time('    nestingGraph.run', function () {
    nestingGraph.run(g)
  })
  time('    rank', function () {
    rank(g)
  })
  time('    injectEdgeLabelProxies', function () {
    injectEdgeLabelProxies(g)
  })
  time('    removeEmptyRanks', function () {
    removeEmptyRanks(g)
  })
  time('    nestingGraph.cleanup', function () {
    nestingGraph.cleanup(g)
  })
  time('    normalizeRanks', function () {
    normalizeRanks(g)
  })
  time('    assignRankMinMax', function () {
    assignRankMinMax(g)
  })
  time('    removeEdgeLabelProxies', function () {
    removeEdgeLabelProxies(g)
  })
  time('    normalize.run', function () {
    normalize.run(g)
  })
  time('    parentDummyChains', function () {
    parentDummyChains(g)
  })
  time('    addBorderSegments', function () {
    addBorderSegments(g)
  })
  time('    order', function () {
    order(g)
  })
  time('    insertSelfEdges', function () {
    insertSelfEdges(g)
  })
  time('    adjustCoordinateSystem', function () {
    coordinateSystem.adjust(g)
  })
  time('    position', function () {
    position(g)
  })
  time('    positionSelfEdges', function () {
    positionSelfEdges(g)
  })
  time('    removeBorderNodes', function () {
    removeBorderNodes(g)
  })
  time('    normalize.undo', function () {
    normalize.undo(g)
  })
  time('    fixupEdgeLabelCoords', function () {
    fixupEdgeLabelCoords(g)
  })
  time('    undoCoordinateSystem', function () {
    coordinateSystem.undo(g)
  })
  time('    translateGraph', function () {
    translateGraph(g)
  })
  time('    assignNodeIntersects', function () {
    assignNodeIntersects(g)
  })
  time('    reversePoints', function () {
    reversePointsForReversedEdges(g)
  })
  time('    acyclic.undo', function () {
    acyclic.undo(g)
  })
}

/*
 * Copies final layout information from the layout graph back to the input
 * graph. This process only copies whitelisted attributes from the layout graph
 * to the input graph, so it serves as a good place to determine what
 * attributes can influence layout.
 */
function updateInputGraph(inputGraph: DagreGraph, layoutGraph: DagreGraph) {
  _.forEach(inputGraph.nodes(), function (v) {
    const inputLabel = inputGraph.node(v)
    const layoutLabel = layoutGraph.node(v)

    if (inputLabel) {
      inputLabel.x = layoutLabel.x
      inputLabel.y = layoutLabel.y

      if (layoutGraph.children(v).length) {
        inputLabel.width = layoutLabel.width
        inputLabel.height = layoutLabel.height
      }
    }
  })

  _.forEach(inputGraph.edges(), function (e) {
    const inputLabel = inputGraph.edge(e)
    const layoutLabel = layoutGraph.edge(e)

    inputLabel.points = layoutLabel.points
    inputLabel.labelPoint = layoutLabel.labelPoint
    if (_.has(layoutLabel, 'x')) {
      inputLabel.x = layoutLabel.x
      inputLabel.y = layoutLabel.y
    }
  })

  inputGraph.graph().width = layoutGraph.graph().width
  inputGraph.graph().height = layoutGraph.graph().height
}

type GraphAttrKey = keyof GraphOpts
type EdgeAttrKey = keyof EdgeOpts

const graphNumAttrs: GraphAttrKey[] = [
  'nodesep',
  'edgesep',
  'ranksep',
  'marginx',
  'marginy',
]

const graphDefaults: Partial<GraphOpts> = {
  ranksep: 50,
  edgesep: 20,
  nodesep: 50,
  rankdir: 'tb',
  splines: 'polyline',
  avoid_label_on_border: false,
}

const graphAttrs: GraphAttrKey[] = [
  'acyclicer',
  'ranker',
  'rankdir',
  'align',
  'splines',
  'avoid_label_on_border',
]
const nodeNumAttrs = [
  'width',
  'height',
  'marginl',
  'marginr',
  'margint',
  'marginb',
  'minwidth',
]
const nodeDefaults: NodeOpts = {
  width: 0,
  height: 0,
  marginl: 0,
  marginr: 0,
  margint: 0,
  marginb: 0,
}
const edgeNumAttrs = ['minlen', 'weight', 'width', 'height', 'labeloffset']
const edgeDefaults: Partial<DEdge> = {
  minlen: 1,
  weight: 1,
  width: 0,
  height: 0,
  labeloffset: 10,
  labelpos: 'r',
}
const edgeAttrs: EdgeAttrKey[] = ['labelpos']

/*
 * Constructs a new graph from the input graph, which can be used for layout.
 * This process copies only whitelisted attributes from the input graph to the
 * layout graph. Thus this function serves as a good place to determine what
 * attributes can influence layout.
 */
function buildLayoutGraph<T extends Graph>(inputGraph: T): DagreGraph {
  const g = new Graph<NodeOpts, DEdge, GraphOpts>({
    multigraph: true,
    compound: true,
  })
  const graph = canonicalize(inputGraph.graph()) as GraphData

  g.setGraph(
    Object.assign(
      {},
      graphDefaults,
      selectNumberAttrs(graph, graphNumAttrs),
      _.pick(graph, graphAttrs),
      {
        borderRanks: new Set(),
      }
    )
  )

  _.forEach(inputGraph.nodes(), function (v) {
    const node = canonicalize(inputGraph.node(v))
    g.setNode(
      v,
      _.defaults(selectNumberAttrs(node, nodeNumAttrs), nodeDefaults)
    )
    g.setParent(v, inputGraph.parent(v) as any)
  })

  _.forEach(inputGraph.edges(), function (e) {
    const edge = canonicalize(inputGraph.edge(e))
    g.setEdge(
      e,
      Object.assign(
        {},
        edgeDefaults,
        selectNumberAttrs(edge, edgeNumAttrs),
        _.pick(edge, edgeAttrs)
      ) as DEdge
    )
  })

  return g as unknown as DagreGraph
}

/*
 * This idea comes from the Gansner paper: to account for edge labels in our
 * layout we split each rank in half by doubling minlen and halving ranksep.
 * Then we can place labels at these mid-points between nodes.
 *
 * We also add some minimal padding to the width to push the label for the edge
 * away from the edge itself a bit.
 */
function makeSpaceForEdgeLabels(g: DagreGraph) {
  const graph = g.graph()
  graph.ranksep /= 2
  _.forEach(g.edges(), function (e) {
    const edge: DEdge = g.edge(e)
    edge.minlen *= 2
    if (edge.labelpos.toLowerCase() !== 'c') {
      if (graph.rankdir === 'TB' || graph.rankdir === 'BT') {
        edge.width += edge.labeloffset
      } else {
        edge.height += edge.labeloffset
      }
    }
  })
}

/*
 * Creates temporary dummy nodes that capture the rank in which each edge's
 * label is going to, if it has one of non-zero width and height. We do this
 * so that we can safely remove empty ranks while preserving balance for the
 * label's position.
 */
function injectEdgeLabelProxies(g: Graph<DNode>) {
  _.forEach(g.edges(), function (e) {
    const edge: DEdge = g.edge(e)
    if (edge.width && edge.height) {
      const v: DNode = g.node(e.v)
      const w: DNode = g.node(e.w)
      const label = { rank: (w.rank - v.rank) / 2 + v.rank, e: e }
      util.addDummyNode(g, 'edge-proxy', label, '_ep')
    }
  })
}

function assignRankMinMax(g: DagreGraph) {
  let maxRank = 0
  _.forEach(g.nodes(), function (v) {
    const node: DNode = g.node(v)
    if (node.borderTop) {
      node.minRank = g.node(node.borderTop).rank
      node.maxRank = g.node(node.borderBottom).rank
      maxRank = Math.max(maxRank, node.maxRank)
    }
  })
  g.graph().maxRank = maxRank
}

function removeEdgeLabelProxies(g: DagreGraph) {
  _.forEach(g.nodes(), function (v) {
    const node = g.node(v)
    if (node.dummy === 'edge-proxy') {
      g.edge(node.e).labelRank = node.rank
      g.removeNode(v)
    }
  })
}

function translateGraph(g: DagreGraph) {
  let minX = Number.POSITIVE_INFINITY
  let maxX = 0
  let minY = Number.POSITIVE_INFINITY
  let maxY = 0
  const graphLabel: GraphData = g.graph()
  const marginX = graphLabel.marginx || 0
  const marginY = graphLabel.marginy || 0

  function getExtremes(attrs: DNode | DEdge) {
    const x = attrs.x
    const y = attrs.y
    const w = Math.max(
      ('minwidth' in attrs ? attrs.minwidth : 0) || 0,
      attrs.width
    )
    const h = attrs.height
    minX = Math.min(minX, x - w / 2)
    maxX = Math.max(maxX, x + w / 2)
    minY = Math.min(minY, y - h / 2)
    maxY = Math.max(maxY, y + h / 2)
  }

  _.forEach(g.nodes(), function (v) {
    getExtremes(g.node(v))
  })
  _.forEach(g.edges(), function (e) {
    const edge = g.edge(e)
    if (_.has(edge, 'x')) {
      getExtremes(edge)
    }
  })

  minX -= marginX
  minY -= marginY

  _.forEach(g.nodes(), function (v) {
    const node = g.node(v)
    node.x -= minX
    node.y -= minY
  })

  _.forEach(g.edges(), function (e) {
    const edge = g.edge(e)
    _.forEach(edge.points, function (p) {
      p.x -= minX
      p.y -= minY
    })
    if (_.has(edge, 'x')) {
      edge.x -= minX
    }
    if (_.has(edge, 'y')) {
      edge.y -= minY
    }
  })

  graphLabel.width = maxX - minX + marginX
  graphLabel.height = maxY - minY + marginY
}

function assignNodeIntersects(g: DagreGraph) {
  const { rankdir, splines, borderRanks, nodesep, avoid_label_on_border } =
    g.graph()
  const isTopBottom = rankdir.toUpperCase() === 'TB'
  const isBottomTop = rankdir.toUpperCase() === 'BT'
  const isVerticalLayout = isBottomTop || isTopBottom
  const isOrthogonal = splines === 'ortho'
  _.forEach(g.edges(), function (e) {
    const edge: DEdge = g.edge(e)
    const nodeV = g.node(e.v)
    const nodeW = g.node(e.w)
    let p1: Point | null = null
    let p2: Point | null = null

    // console.log('1. node v w rank', nodeV.rank, nodeW.rank)
    // console.log('1. edge.points', edge.points.length, JSON.stringify(edge.points))

    if (!edge.points) {
      // link two rects' center
      edge.points = []
      p1 = nodeW
      p2 = nodeV
      edge.points.unshift(util.intersectRect(nodeV, p1))
      edge.points.push(util.intersectRect(nodeW, p2))
    } else {
      p1 = edge.points[0]
      p2 = edge.points[edge.points.length - 1]
      const pointsBetween = edge.points.slice(1, edge.points.length - 1)

      if (avoid_label_on_border) {
        const isLabelPointOnBorder = borderRanks.has(nodeV.rank + 1)
        // we can move the label points down a little bit
        // this should be done before shallow copy of labelPoint
        if (isLabelPointOnBorder) {
          p1.y += nodesep
        }
      }

      const labelPoint = { ...p1 }
      edge.labelPoint = labelPoint

      const origInterWithV = util.intersectRect(nodeV, labelPoint)
      const origInterWithW = util.intersectRect(nodeW, p2)
      let edgePointsArranged = false
      if (isOrthogonal) {
        const nodesInfo = comparePositions(nodeV, nodeW)
        const { leftOne, rightOne, bottomOne, topOne } = nodesInfo
        // to form as orthogonal drawing
        const lastPointInBetween = pointsBetween.length
          ? pointsBetween[pointsBetween.length - 1]
          : null
        const rangeOfVWCenter: Record<string, RangeTupple> = {
          x: [leftOne.x, rightOne.x],
          y: [topOne.y, bottomOne.y],
        }
        // in some scenarios we should not bend points
        // 1. if v and w's non-layout-axis coords are equal
        // 2. if labelPoint is outside of range of vw center-points. to avoid intersection of edges,
        //      this is not perfect, we should move conflict resolving before this phase
        if (
          isVerticalLayout &&
          !nodesInfo.isXEqual &&
          isInsideRange(labelPoint.x, rangeOfVWCenter.x)
        ) {
          const topRectBottomBound = topOne.y + topOne.height / 2
          const bottomRectUpperBound = bottomOne.y - bottomOne.height / 2
          const newInterWithV = {
            ...origInterWithV,
          }
          const newInterWithW = {
            ...origInterWithW,
          }
          newInterWithV.y = Math.max(origInterWithV.y, topRectBottomBound)
          newInterWithW.y = Math.min(origInterWithW.y, bottomRectUpperBound)

          p1 = { x: newInterWithV.x, y: labelPoint.y }
          p2 = { x: newInterWithW.x, y: (lastPointInBetween || labelPoint).y }

          const newPoints = [
            newInterWithV,
            p1,
            labelPoint,
            ...pointsBetween,
            p2,
            newInterWithW,
          ]
          // try to form a linear segment if all points are between v and w's overlap in x axis
          const overlapXRange: [number, number] = [
            rightOne.x - rightOne.width / 2,
            leftOne.x + leftOne.width / 2,
          ]
          if (overlapXRange[0] < overlapXRange[1]) {
            const isAllInRange = newPoints.every((p) => {
              return isInsideRange(p.x, overlapXRange)
            })
            if (isAllInRange) {
              for (const p of newPoints) {
                p.x = labelPoint.x
              }
            }
          }

          edge.points = newPoints
          edgePointsArranged = true
        } else if (
          !isVerticalLayout &&
          !nodesInfo.isYEqual &&
          isInsideRange(labelPoint.y, rangeOfVWCenter.y)
        ) {
          const { leftOne, rightOne } = nodesInfo
          const leftRectRightBound = leftOne.x + leftOne.width / 2
          const rightRectLeftBound = rightOne.x - rightOne.width / 2
          const newInterWithV = {
            ...origInterWithV,
            x: Math.max(origInterWithV.x, leftRectRightBound),
          }
          const newInterWithW = {
            ...origInterWithW,
            x: Math.min(origInterWithW.x, rightRectLeftBound),
          }
          p1 = { x: labelPoint.x, y: newInterWithV.y }
          p2 = { x: (lastPointInBetween || labelPoint).x, y: newInterWithW.y }

          const newPoints = [
            newInterWithV,
            p1,
            labelPoint,
            ...pointsBetween,
            p2,
            newInterWithW,
          ]
          // try to form a linear segment if all points are between v and w's overlap in y axis
          const overlapYRange: [number, number] = [
            bottomOne.y - bottomOne.height / 2,
            topOne.y + topOne.height / 2,
          ]
          if (overlapYRange[0] < overlapYRange[1]) {
            const isAllInRange = newPoints.every((p) => {
              return isInsideRange(p.y, overlapYRange)
            })
            if (isAllInRange) {
              for (const p of newPoints) {
                p.y = labelPoint.y
              }
            }
          }

          edge.points = newPoints
          edgePointsArranged = true
        }
      }
      if (!edgePointsArranged) {
        // by default, add intersection points of both nodes to edge.points
        const intersectWithV = util.intersectRect(nodeV, labelPoint)
        const intersectWithW = util.intersectRect(nodeW, p2)
        edge.points.unshift(intersectWithV)
        edge.points.push(intersectWithW)
      }
    }
  })
}

function fixupEdgeLabelCoords(g: DagreGraph) {
  _.forEach(g.edges(), function (e) {
    const edge = g.edge(e)
    if (_.has(edge, 'x')) {
      if (edge.labelpos === 'l' || edge.labelpos === 'r') {
        edge.width -= edge.labeloffset
      }
      switch (edge.labelpos) {
        case 'l':
          edge.x -= edge.width / 2 + edge.labeloffset
          break
        case 'r':
          edge.x += edge.width / 2 + edge.labeloffset
          break
      }
    }
  })
}

function reversePointsForReversedEdges(g: DagreGraph) {
  _.forEach(g.edges(), function (e) {
    const edge = g.edge(e)
    if (edge.reversed) {
      edge.points.reverse()
    }
  })
}

// remove dummy border nodes for subgraph
function removeBorderNodes(g: DagreGraph) {
  const { borderRanks } = g.graph()
  _.forEach(g.nodes(), function (v) {
    if (g.children(v).length) {
      const node: DNode = g.node(v)!
      const t = g.node(node.borderTop)
      const b = g.node(node.borderBottom)
      const l = g.node(_.last(node.borderLeft))
      const r = g.node(_.last(node.borderRight))
      borderRanks.add(t.rank)
      borderRanks.add(b.rank)

      const widthBetweenBorder = Math.abs(r.x - l.x)
      node.width = Math.max(widthBetweenBorder, node.minwidth || 0)
      if (node.minwidth && node.minwidth > widthBetweenBorder) {
        const wOffset = node.minwidth - widthBetweenBorder
        const originalRightEdge = Math.min(l.x, r.x) + widthBetweenBorder

        // move all the nodes those are right of original right edge,
        // so that there is enough space for the expandsion to node.minwidth .
        addOffsetFromX(wOffset, originalRightEdge)
      }

      node.height = Math.abs(b.y - t.y)
      node.x = l.x + node.width / 2
      node.y = t.y + node.height / 2
    }
  })

  _.forEach(g.nodes(), function (v) {
    if (g.node(v).dummy === 'border') {
      g.removeNode(v)
    }
  })

  function addOffsetFromX(wOffset: number, startX: number) {
    const visited: Record<string, boolean> = {}

    const dfs = (v: string) => {
      if (visited[v]) return
      visited[v] = true

      const node: DNode = g.node(v)!
      if (node.x >= startX) node.x += wOffset

      for (const child of g.children(v)) dfs(child)
    }

    for (const v of g.nodes()) dfs(v)
  }
}

function removeSelfEdges(g: DagreGraph) {
  _.forEach(g.edges(), function (e) {
    if (e.v === e.w) {
      const node = g.node(e.v)
      if (!node.selfEdges) {
        node.selfEdges = []
      }
      node.selfEdges.push({ e: e, label: g.edge(e) })
      g.removeEdge(e)
    }
  })
}

function insertSelfEdges(g: Graph) {
  const layers = util.buildLayerMatrix(g)
  layers.forEach(function (layer) {
    let orderShift = 0
    layer.forEach(function (v, i) {
      const node: DNode = g.node(v)
      node.order = i + orderShift
      _.forEach(node.selfEdges, function (selfEdge) {
        util.addDummyNode(
          g,
          'selfedge',
          {
            width: selfEdge.label.width,
            height: selfEdge.label.height,
            rank: node.rank,
            order: i + ++orderShift,
            e: selfEdge.e,
            label: selfEdge.label,
          },
          '_se'
        )
      })
      delete node.selfEdges
    })
  })
}

function positionSelfEdges(g: DagreGraph) {
  _.forEach(g.nodes(), function (v) {
    const node: DNode = g.node(v)
    if (node.dummy === 'selfedge') {
      const selfNode = g.node(node.e.v)
      const x = selfNode.x + selfNode.width / 2
      const y = selfNode.y
      const dx = node.x - x
      const dy = selfNode.height / 2
      g.setEdge(node.e, node.label)
      g.removeNode(v)
      node.label.points = [
        { x: x + (2 * dx) / 3, y: y - dy },
        { x: x + (5 * dx) / 6, y: y - dy },
        { x: x + dx, y: y },
        { x: x + (5 * dx) / 6, y: y + dy },
        { x: x + (2 * dx) / 3, y: y + dy },
      ]
      node.label.x = node.x
      node.label.y = node.y
    }
  })
}

function selectNumberAttrs(obj, attrs) {
  return _.mapValues(_.pick(obj, attrs), Number)
}

function canonicalize(attrs) {
  const newAttrs = {}
  _.forEach(attrs, function (v, k) {
    newAttrs[k.toLowerCase()] = v
  })
  return newAttrs
}

const getSlant = (pBase: Point, pTarget: Point) => {
  return Math.abs(pTarget.y - pBase.y) / Math.abs(pTarget.x - pBase.x)
}

export default layout
