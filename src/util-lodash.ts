import forEach from 'lodash-es/forEach'
import pick from 'lodash-es/pick'
import defaults from 'lodash-es/defaults'
import mapValues from 'lodash-es/mapValues'
import map from 'lodash-es/map'
import flatten from 'lodash-es/flatten'
import range from 'lodash-es/range'
import values from 'lodash-es/values'
import reduce from 'lodash-es/reduce'
import minBy from 'lodash-es/minBy'
import maxBy from 'lodash-es/maxBy'
import min from 'lodash-es/min'
import max from 'lodash-es/max'
import filter from 'lodash-es/filter'
import uniqueId from 'lodash-es/uniqueId'
import zipObject from 'lodash-es/zipObject'
import sortBy from 'lodash-es/sortBy'
import find from 'lodash-es/find'
import toPairs from 'lodash-es/toPairs'
import cloneDeep from 'lodash-es/cloneDeep'

function has<T>(o: T, k: string) {
  return o && k && (k in o)
}

function last<T>(list: T[]) {
  if (!(list && list.length)) return
  return list[list.length - 1]
}

function isUndefined(o) {
  return typeof o === 'undefined'
}

export {
  forEach,
  pick,
  defaults,
  mapValues,
  map,
  flatten,
  range,
  values,
  reduce,
  has,
  last,
  isUndefined,
  minBy,
  maxBy,
  min,
  max,
  filter,
  uniqueId,
  zipObject,
  sortBy,
  find,
  toPairs,
  cloneDeep,
}
