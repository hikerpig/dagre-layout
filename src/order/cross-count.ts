import { Graph } from '@pintora/graphlib'
import * as _ from '../util-lodash'

/*
 * A function that takes a layering (an array of layers, each with an array of
 * ordererd nodes) and a graph and returns a weighted crossing count.
 *
 * Pre-conditions:
 *
 *    1. Input graph must be simple (not a multigraph), directed, and include
 *       only simple edges.
 *    2. Edges in the input graph must have assigned weights.
 *
 * Post-conditions:
 *
 *    1. The graph and layering matrix are left unchanged.
 *
 * This algorithm is derived from Barth, et al., "Bilayer Cross Counting."
 */
function crossCount(g, layering) {
  let cc = 0
  for (let i = 1; i < layering.length; ++i) {
    cc += twoLayerCrossCount(g, layering[i - 1], layering[i])
  }
  return cc
}

function twoLayerCrossCount(g: Graph, northLayer, southLayer) {
  // Sort all of the edges between the north and south layers by their position
  // in the north layer and then the south. Map these edges to the position of
  // their head in the south layer.
  const southPos = _.zipObject<number>(
    southLayer,
    southLayer.map(function (v, i) {
      return i
    })
  )
  const southEntries = _.flatten(
    _.map(northLayer, function (v) {
      const list = (g.outEdges(v) || []).map(function (e) {
        return { pos: southPos[e.w], weight: g.edge(e).weight }
      })
      return _.sortBy(list, 'pos')
    })
  )

  // Build the accumulator tree
  let firstIndex = 1
  while (firstIndex < southLayer.length) {
    firstIndex <<= 1
  }
  const treeSize = 2 * firstIndex - 1
  firstIndex -= 1
  const tree = _.map(new Array(treeSize), function () {
    return 0
  })

  // Calculate the weighted crossings
  let cc = 0
  southEntries.forEach(function (entry) {
    let index = entry.pos + firstIndex
    tree[index] += entry.weight
    let weightSum = 0
    while (index > 0) {
      if (index % 2) {
        weightSum += tree[index + 1]
      }
      index = (index - 1) >> 1
      tree[index] += entry.weight
    }
    cc += entry.weight * weightSum
  })

  return cc
}

export default crossCount
