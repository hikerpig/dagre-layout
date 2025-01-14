import dagre from '#dagre-layout'
// import d3 from 'd3'
import dotparser from 'dotparser';
import './App'

let debugTiming = false
let time = dagre.util.notime
let lastDotStr = ''
// const input = document.querySelector('#inputPanel textarea')


function renderDot (force=false) {
  // debugTiming = d3.select('#timing').property('checked')
  // time = debugTiming ? dagre.util.time : dagre.util.notime

  // const dotStr = input.value
  // if (dotStr !== lastDotStr || force) {
  //   lastDotStr = dotStr
  //   input.className = ''
  //   try {
  //     const g = formGraph()
  //     time('render', function () { render(g) })
  //     window.currentG = g
  //   } catch (e) {
  //     input.className = 'error'
  //     throw e
  //   }
  // }
}

// document.addEventListener('DOMContentLoaded', () => renderDot())
// document.body.addEventListener('dblclick', () => renderDot(true))

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

// input.onkeydown = function (e) {
//   if (e.keyCode === 9) {
//     e.preventDefault()
//     const s = this.selectionStart
//     this.value = this.value.substring(0, this.selectionStart) + '    ' +
//                  this.value.substring(this.selectionEnd)
//     this.selectionEnd = s + 4
//   }
// }

// function render (g) {
//   const svg = d3.select('svg')
//   svg.selectAll('g').remove()
//   const group = svg.append('g')
//   time('preLayout', function () { preLayout(g, group) })
//   dagre.layout(g, { debugTiming: debugTiming })
//   time('postLayout', function () { postLayout(g, svg, group) })
// }

// function preLayout (g, svg) {
//   _.forEach(g.edges(), function (e) {
//     const edge = g.edge(e)
//     if (edge.label) {
//       const group = appendLabel(svg, edge.label, edge, 0, 0)
//       group.attr('id', 'edge-' + edgeObjToId(e)).classed('edge', true)
//     }
//   })

//   console.log('nodes', g.nodes())
//   _.forEach(g.nodes(), function (v) {
//     if (g.children(v).length) {
//       return
//     }
//     const node = g.node(v)
//     const group = appendLabel(svg, node.label || v, node, 10, 10)
//     group.attr('id', 'node-' + id(v)).classed('node', true)
//   })
// }

// function appendLabel (target, label, graphObj, marginX, marginY) {
//   const group = target.append('g')
//   const rect = group.append('rect')
//   const text = group.append('text').attr('text-anchor', 'left')
//   text.append('tspan').attr('dy', '1em').text(label)

//   const textBBox = text.node().getBBox()
//   text.attr('transform',
//             'translate(' + (-textBBox.width / 2) + ',' +
//                            (-textBBox.height / 2) + ')')

//   let bbox = group.node().getBBox()
//   rect
//     .attr('rx', 5)
//     .attr('ry', 5)
//     .attr('x', -(bbox.width / 2 + marginX))
//     .attr('y', -(bbox.height / 2 + marginY))
//     .attr('width', bbox.width + 2 * marginX)
//     .attr('height', bbox.height + 2 * marginY)
//     .attr('fill', '#fff')
//   bbox = group.node().getBBox()

//   graphObj.width = bbox.width
//   graphObj.height = bbox.height

//   return group
// }

// function postLayout (g, root, svg) {
//   root.insert('rect', ':first-child')
//     .attr('width', '100%')
//     .attr('height', '100%')
//     .style('fill', 'none')
//     .style('pointer-events', 'all')
//   root.call(d3.behavior.zoom().on('zoom', function () {
//     svg.attr('transform', 'translate(' + d3.event.translate + ')' +
//                             'scale(' + d3.event.scale + ')')
//   }))

//   _.forEach(g.edges(), function (e) {
//     const group = svg.select('g#edge-' + edgeObjToId(e))
//     if (!group.empty()) {
//       const edge = g.edge(e)
//       group.attr('transform', 'translate(' + edge.x + ',' + edge.y + ')')
//     }
//   })

//   _.forEach(g.nodes(), function (v) {
//     const group = svg.select('g#node-' + id(v))
//     const node = g.node(v)
//     group.attr('transform', 'translate(' + node.x + ',' + node.y + ')')
//   })

//   _.forEach(g.edges(), function (e) {
//     const points = g.edge(e).points
//     const path = svg.insert('path', ':first-child')
//                 .classed('edge', true)
//                 .attr('marker-end', 'url(#arrowhead)')
//     const line = d3.svg.line()
//                 .x(function (d) { return d.x })
//                 .y(function (d) { return d.y })
//     path.attr('d', line(points))
//   })

//   function dfsChildren (v) {
//     const children = g.children(v)
//     if (children.length) {
//       _.forEach(children, dfsChildren)

//       const node = g.node(v)
//       console.log('subgraph node', node)
//       svg.insert('g', ':first-child')
//          .classed('subgraph', true)
//          .attr('transform', 'translate(' + (node.x - node.width / 2) + ',' +
//                                        (node.y - node.height / 2) + ')')
//          .append('rect')
//            .attr('width', node.width)
//            .attr('height', node.height)
//     }
//   };
//   _.forEach(g.children(), dfsChildren)
// }

// function edgeObjToId (e) {
//   // Not particularly safe, but good enough for our needs.
//   return id(e.v) + '-' + id(e.w) + '-' + id(e.name)
// }

// function id (str) {
//   return str ? str.replace(/[^a-zA-z0-9-]/g, '_') : ''
// }
