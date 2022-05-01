import dotparser, { Graph } from 'dotparser'

// type DotResultItem = {
//   id: string
//   type: string
//   children: Array<{
//     edge_list: any[]
//     type: string
//   }>
// }

export function parseDot(str: string) {
  const result = dotparser(str)
  console.log('r', result)
  return result
}
