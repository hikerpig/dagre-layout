/* eslint-env jest */
import { expect } from 'chai'

import List from '../../src/data/list'

describe('data.List', function () {
  let list

  beforeEach(function () {
    list = new List()
  })

  describe('dequeue', function () {
    it('returns undefined with an empty list', function () {
      expect(list.dequeue()).to.equal(undefined)
    })

    it('unlinks and returns the first entry', function () {
      const obj = {}
      list.enqueue(obj)
      expect(list.dequeue()).to.equal(obj)
    })

    it('unlinks and returns multiple entries in FIFO order', function () {
      const obj1 = {}
      const obj2 = {}
      list.enqueue(obj1)
      list.enqueue(obj2)

      expect(list.dequeue()).to.equal(obj1)
      expect(list.dequeue()).to.equal(obj2)
    })

    it('unlinks and relinks an entry if it is re-enqueued', function () {
      const obj1 = {}
      const obj2 = {}
      list.enqueue(obj1)
      list.enqueue(obj2)
      list.enqueue(obj1)

      expect(list.dequeue()).to.equal(obj2)
      expect(list.dequeue()).to.equal(obj1)
    })

    it('unlinks and relinks an entry if it is enqueued on another list', function () {
      const obj = {}
      const list2 = new List()
      list.enqueue(obj)
      list2.enqueue(obj)

      expect(list.dequeue()).to.equal(undefined)
      expect(list2.dequeue()).to.equal(obj)
    })

    it('can return a string representation', function () {
      list.enqueue({ entry: 1 })
      list.enqueue({ entry: 2 })

      expect(list.toString()).to.equal('[{"entry":1}, {"entry":2}]')
    })
  })
})
