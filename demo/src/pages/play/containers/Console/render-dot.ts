import dagre, { DagreGraph } from '#dagre-layout'
import { Graph } from '@pintora/graphlib'
import { render as pintoraRender } from '@pintora/renderer'
import { makeMark, makeEmptyGroup } from '@pintora/diagrams/lib/util/artist-util'
import { getPointsLinearPath } from '@pintora/diagrams/lib/util/line-util'
import { parseDot } from '../../utils/dot'
import { GraphicsIR } from '@pintora/core'

type RenderDotOpts = {
  input: string
  container: HTMLDivElement
  force?: boolean
  debugTiming?: boolean
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
      time('render', function () { render(g, opts) })
      // window.currentG = g
    } catch (e) {
      // input.className = 'error'
      throw e
    }
  }
}

function formGraph(str: string) {
  const result = parseDot(str)
  const g = new Graph({ compound: true })
    .setGraph({})
  const firstItem = result[0]

  function tryAddNode(id: string) {
    if (!g.node(id)) {
      g.setNode(id, {
        width: 20,
        height: 20,
      })
    }
  }

  firstItem.children.forEach((stmt) => {
    if (stmt.type === 'edge_stmt') {
      for (let i = 1; i < stmt.edge_list.length; i++) {
        const e = stmt.edge_list[i]
        const prevE = stmt.edge_list[i - 1]
        const label = `${prevE.id}-${e.id}`
        const prevId = String(prevE.id)
        const currentId = String(e.id!)
        g.setEdge(prevId, currentId, { label })
        tryAddNode(prevId)
        tryAddNode(currentId)
      }
    } else if (stmt.type === 'node_stmt') {
      console.log('node stmt', stmt)
    }
  })

  return g
}

// function formGraph() {
//   const g = new graphlib.Graph({ compound: true })
//     .setGraph({})

//   g.setNode('a', { label: 'a', marginl: 10 })
//   g.setNode('b', { label: 'b', marginr: 30, margint: 15 })
//   g.setNode('c', { label: 'c', marginl: 15, marginr: 60 })
//   g.setNode('d', { label: 'd', marginr: 10, margint: 0 })
//   g.setNode('e', { label: 'e', marginl: 25, margint: 40 })
//   g.setEdge('a', 'b', { label: 'ab' })
//   g.setEdge('a', 'd', { label: 'ad' })
//   g.setParent('b', 'c')
//   g.setParent('d', 'e')

//   return g
// }

function render(g: DagreGraph, opts: RenderDotOpts) {
  dagre.layout(g, { debugTiming: opts.debugTiming })

  const rootMark = makeEmptyGroup()

  opts.container.innerHTML = '' // clear

  g.nodes().forEach((n) => {
    const node = g.node(n)
    const rect = makeMark('rect', {
      width: node.width,
      height: node.height,
      x: node.x - node.width / 2,
      y: node.y - node.height / 2,
      fill: '#fff',
      stroke: '#000'
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
