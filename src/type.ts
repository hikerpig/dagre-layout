export type Entry = {
  indegree: number
  in: Entry[]
  out: Entry[]
  vs: string[]
  i: number
  v?: string
  barycenter?: number
  weight?: number
}

export type Barycenter = Pick<Entry, 'v' | 'barycenter' | 'weight'>
