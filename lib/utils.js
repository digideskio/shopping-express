'use strict';

function merge(cache, type, id, data) {
  cache = cache || {};
  if (!cache[type]) {
    cache[type] = {};
  }
  cache[type][id] = data;
  return cache;
}

function mergeCache(cache1, cache2) {
  for (let k in cache2) {
    for (let kk in cache2[k]) {
      cache1 = merge(cache1, k, kk, cache2[k][kk]);
    }
  }
  return cache1;
}

function makeCollection(spec) {
  let meta = spec.meta || {};
  let params = spec.params || {};

  if (typeof meta.total === 'undefined') { meta.total = 0; }
  meta.limit = params.limit ? params.limit : null;
  meta.offset = params.offset ? params.offset : 0;

  return { $type: 'collection', $path: spec.path, $params: params, $meta: meta, $data: [] };
}

function addToCollection(coll, obj) {
  coll.$data.push(obj);
  return coll;
}

function makeObject(spec) {
  return { $type: 'object', $path: spec.path };
}


module.exports = {
  merge: merge,
  mergeCache: mergeCache,
  makeCollection: makeCollection,
  addToCollection: addToCollection,
  makeObject: makeObject
};
