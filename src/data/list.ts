/*
 * Simple doubly linked list implementation derived from Cormen, et al.,
 * "Introduction to Algorithms".
 */

type Setinel = {
  _next?: Setinel
  _prev?: Setinel
}

function List() {
  const sentinel: Setinel = {}
  sentinel._next = sentinel._prev = sentinel
  this._sentinel = sentinel
}

List.prototype.dequeue = function () {
  const sentinel = this._sentinel
  const entry = sentinel._prev
  if (entry !== sentinel) {
    unlink(entry)
    return entry
  }
}

List.prototype.enqueue = function (entry) {
  const sentinel = this._sentinel
  if (entry._prev && entry._next) {
    unlink(entry)
  }
  entry._next = sentinel._next
  sentinel._next._prev = entry
  sentinel._next = entry
  entry._prev = sentinel
}

List.prototype.toString = function () {
  const strs = []
  const sentinel = this._sentinel
  let curr = sentinel._prev
  while (curr !== sentinel) {
    strs.push(JSON.stringify(curr, filterOutLinks))
    curr = curr._prev
  }
  return '[' + strs.join(', ') + ']'
}

function unlink(entry) {
  entry._prev._next = entry._next
  entry._next._prev = entry._prev
  delete entry._next
  delete entry._prev
}

function filterOutLinks(k, v) {
  if (k !== '_next' && k !== '_prev') {
    return v
  }
}

export default List
