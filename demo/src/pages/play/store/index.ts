import { observable, makeAutoObservable } from 'mobx'
import { Example, EXAMPLES } from '../data/examples'

export class Model {
  exampleId = ''

  constructor() {
    makeAutoObservable(this)
  }

  selectExample(exampleId: string) {
    this.exampleId = exampleId
  }

  get currentExample() {
    if (!this.exampleId) return undefined
    return EXAMPLES[this.exampleId]
  }
}

// function makeModel() {
//   return observable({

//   })
// }

// export const model = makeModel()

export const model = new Model()
