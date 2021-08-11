import * as _ from '../util-lodash'

import util, { Graph } from '../util'
import { positionX } from './bk'
import { DNode, GraphOpts } from '../type'

function position(g: Graph) {
  positionY(g)
  _.forEach(positionX(g), function (x, v) {
    const node = g.node(v)
    if (node) node.x = x
  })
}

function positionY(g) {
  const layering = util.buildLayerMatrix(g)
  const rankSep = (g.graph() as GraphOpts).ranksep
  let prevY = 0
  _.forEach(layering, function (layer) {
    const maxHeight = _.max(
      _.map(layer, function (v) {
        if (v) {
          const node: DNode = g.node(v)
          return node.height + (node.margint || 0) + (node.marginb || 0)
        }
      })
    )
    _.forEach(layer, function (v) {
      if (v) g.node(v).y = prevY + maxHeight / 2
    })
    prevY += maxHeight + rankSep
  })
}

export default position
