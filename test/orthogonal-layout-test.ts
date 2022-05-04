import { Graph } from '@pintora/graphlib'
import layout from '../src/layout'
import { expect } from 'chai'
import { DagreGraph, DEdge, DNode } from 'src/type'

describe('orthogonal layout', () => {
  const defaultAttrs = { width: 20, height: 20 } as DNode

  let g: Graph

  beforeEach(function () {
    g = new Graph({ multigraph: true, compound: true })
      .setGraph({
        splines: 'ortho',
      })
      .setDefaultEdgeLabel(function () {
        return {}
      })
  })

  it('reduce edge bendpoints - to straigh line - under some conditions', () => {
    g.setNode('a', { width: 120, height: 20 })
    g.setNode('b', { ...defaultAttrs, width: 30 })
    g.setNode('c', { ...defaultAttrs, width: 100 })
    g.setNode('d', { ...defaultAttrs })
    g.setNode('e', { ...defaultAttrs })
    g.setEdge('a', 'b', { label: '' })
    g.setEdge('a', 'c', { label: '' })
    g.setEdge('a', 'd', { label: '' })
    g.setEdge('a', 'e', { label: '' })

    layout(g)

    const edgeAC = g.edge('a', 'c') as DEdge
    edgeAC.points.every(p => expect(p.x).to.equal(130))
  })
})
