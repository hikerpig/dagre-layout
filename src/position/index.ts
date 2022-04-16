import * as _ from '../util-lodash'

import util, { getNum } from '../util'
import { positionX } from './bk'
import { DNode, DagreGraph } from '../type'

function position(g: DagreGraph) {
  doPositionY(g)
  _.forEach(positionX(g), function (x, v) {
    const node = g.node(v)
    if (node) node.x = x
  })
}

function doPositionY(g: DagreGraph) {
  const layering = util.buildLayerMatrix(g)
  const rankSep = g.graph().ranksep
  let prevY = 0
  _.forEach(layering, function (layer) {
    let yOffset1 = 0 // upper offset due to parent margint
    let yOffset2 = 0 // bottom offset due to parent marginb
    const maxHeight = _.max(
      _.map(layer, function (v) {
        if (v) {
          const node: DNode = g.node(v)
          const parent = g.parent(v) && g.node(g.parent(v))
          if (parent) {
            yOffset1 = Math.max(getNum(parent.margint), yOffset1)
            yOffset2 = Math.max(getNum(parent.marginb), yOffset2)
          }
          return (
            node.height +
            getNum(node.margint) +
            getNum(node.marginb)
          )
        }
      })
    )
    _.forEach(layer, function (v) {
      if (v) g.node(v).y = prevY + yOffset1 + maxHeight / 2
    })
    prevY += maxHeight + rankSep + yOffset1 + yOffset2
  })
}

export default position
