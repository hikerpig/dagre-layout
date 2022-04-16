import * as _ from '../util-lodash'

import util, { getNum, isNumber } from '../util'
import { positionX } from './bk'
import { DNode, DagreGraph } from '../type'

function position(g: DagreGraph) {
  doPositionY(g)
  _.forEach(positionX(g), function (x, v) {
    const node = g.node(v)
    if (node) node.x = x
  })
}

type RankOffsetItem = {
  marginTop: number
  marginBottom: number
}

function doPositionY(g: DagreGraph) {
  const layering = util.buildLayerMatrix(g)
  const rankSep = g.graph().ranksep
  let prevY = 0

  // get max margins of each rank
  const rankOffsets: Record<number, RankOffsetItem> = {}

  g.nodes().forEach((v) => {
    const node = g.node(v)
    const rank = isNumber(node.minRank) ? node.minRank : node.rank
    if (!rankOffsets[rank]) {
      rankOffsets[rank] = {
        marginTop: 0,
        marginBottom: 0,
      }
    }

    const item = rankOffsets[rank]
    item.marginTop = Math.max(getNum(node.margint), item.marginTop)
    item.marginBottom = Math.max(getNum(node.marginb), item.marginBottom)
  })

  // console.log('rank ofsets', rankOffsets )

  _.forEach(layering, function (layer) {
    let yOffset1 = 0 // upper offset due to parent margint
    let yOffset2 = 0 // bottom offset due to parent marginb
    let maxHeight = 0
    for (const v of layer) {
      if (v) {
        const node: DNode = g.node(v)
        if (rankOffsets[node.rank]) {
          const item = rankOffsets[node.rank]
          yOffset1 = Math.max(item.marginTop, yOffset1)
          yOffset2 = Math.max(item.marginBottom, yOffset2)
        }

        maxHeight = Math.max(maxHeight, node.height + getNum(node.margint) + getNum(node.marginb))
      }
    }
    for (const v of layer) {
      if (v) g.node(v).y = prevY + yOffset1 + maxHeight / 2
    }
    prevY += maxHeight + rankSep + yOffset1 + yOffset2
  })
}

export default position
