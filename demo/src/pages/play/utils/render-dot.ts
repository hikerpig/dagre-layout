import dagre, { DagreGraph, DNode } from '#dagre-layout'
import { GraphicsIR } from '@pintora/core'
import { makeEmptyGroup, makeMark } from '@pintora/diagrams/lib/util/artist-util'
import { getPointsLinearPath } from '@pintora/diagrams/lib/util/line-util'
import { Graph } from '@pintora/graphlib'
import { render as pintoraRender } from '@pintora/renderer'
import { Stmt } from 'dotparser'
import { parseDot } from './dot'

export type RenderDotOpts = {
  input: string
  container: HTMLDivElement
  force?: boolean
  debugTiming?: boolean
  prepareDagreLayout?(g: DagreGraph): void
}

let lastDotStr = ''

export function renderDot(opts: RenderDotOpts) {
  const debugTiming = opts.debugTiming
  const time = debugTiming ? dagre.util.time : dagre.util.notime

  const dotStr = opts.input
  if (dotStr !== lastDotStr || opts.force) {
    lastDotStr = dotStr
    try {
      const g = formGraph(dotStr)
      if (opts.prepareDagreLayout) opts.prepareDagreLayout(g)
      time('render', function () { render(g, opts) })
      ;(window as any).currentG = g
    } catch (e) {
      throw e
    }
  }
}

type NodeData = DNode & {
  fill?: string
  stroke?: string
}

function getAttrs(stmt: Stmt) {
  const attrs: any = {}
  for (const attr of stmt.attr_list) {
    attrs[attr.id] = attr.eq
  }
  return attrs
}

function formGraph(str: string) {
  const result = parseDot(str)
  console.log('dot result', result)
  const g = new Graph({ compound: true })
    .setGraph({})
  const firstItem = result[0]

  function tryAddNode(id: string) {
    if (!g.node(id)) {
      const width = Math.max(20, id.length * 10)
      g.setNode(id, {
        width,
        height: 20,
      })
    }
  }

  firstItem.children.forEach((stmt) => {
    if (stmt.type === 'edge_stmt') {
      const attrs = getAttrs(stmt)

      for (let i = 1; i < stmt.edge_list.length; i++) {
        const e = stmt.edge_list[i]
        const prevE = stmt.edge_list[i - 1]
        // const label = attrs.label || `${prevE.id}-${e.id}`
        const label = attrs.label || ''
        const prevId = String(prevE.id)
        const currentId = String(e.id!)
        g.setEdge(prevId, currentId, { label })
        tryAddNode(prevId)
        tryAddNode(currentId)
      }
    } else if (stmt.type === 'node_stmt') {
      const attrs = getAttrs(stmt)
      const id = String(stmt.node_id.id)
      tryAddNode(id)
      const node = g.node(id)
      if (node) {
        Object.assign(node, attrs)
      }
    }
  })


  return g
}

function render(g: DagreGraph, opts: RenderDotOpts) {
  dagre.layout(g, { debugTiming: opts.debugTiming })

  const rootMark = makeEmptyGroup()

  opts.container.innerHTML = '' // clear

  g.nodes().forEach((n) => {
    const node: NodeData = g.node(n)
    const rect = makeMark('rect', {
      width: node.width,
      height: node.height,
      x: node.x - node.width / 2,
      y: node.y - node.height / 2,
      fill: node.fill || '#fff',
      stroke: node.stroke || '#000'
    })
    const textMark = makeMark('text', {
      text: n,
      x: node.x,
      y: node.y,
      textAlign: 'center',
      textBaseline: 'middle',
      fill: '#000',
    })
    rootMark.children.push(rect, textMark)
  })

  g.edges().forEach((e) => {
    const edge = g.edge(e)
    const p = getPointsLinearPath(edge.points)
    const line = makeMark('path', {
      path: p,
      stroke: '#000',
    })
    if (edge.label) {
      console.log('edge label', edge.label)
    }
    rootMark.children.push(line)
  })
  const graphicsIR: GraphicsIR = {
    width: 300,
    height: 300,
    mark: rootMark,
  }
  pintoraRender(graphicsIR, {
    container: opts.container
  })
  // time('postLayout', function () { postLayout(g, svg, group) })
}

// function edgeObjToId (e) {
//   // Not particularly safe, but good enough for our needs.
//   return id(e.v) + '-' + id(e.w) + '-' + id(e.name)
// }

// function id (str) {
//   return str ? str.replace(/[^a-zA-z0-9-]/g, '_') : ''
// }
