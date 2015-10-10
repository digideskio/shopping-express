'use strict';
const utils = require('./utils');

/*
  PathSpec: string, e.g. 'user->orders'. Determines a handler, and realized into
    Path with potentially object ids slotted between
  Path: Array, e.g. ['user', 1, 'orders']
  Params: Object(simple), e.g. {id: 2}, {filter: '...', sort: '...'}
  Query => [ [PathSpec, Params], CompositeQuery ]
  CompositeQuery: { key: query, ... }

  Graph: GraphObject|GraphCollection
  Cache: Object(simple), e.g. { user: {1: {...}, 2: {...}, ...}, ...}
  QueryResult: {graph: Graph, cache: Cache}
*/

function fetchCompositeQuery(env, cache, parent, query) {
  // console.log('fetchCompositeQuery', parent, query);
  let keys = [];
  let promises = [];
  for (let k in query) {
    keys.push(k);
    promises.push(fetchQuery(env, cache, parent, query[k]));
  }
  return Promise.all(promises).then((resolvedPromises) => {
    let graph = {};
    let cache = {};
    resolvedPromises.forEach((queryResult, i) => {
      graph[keys[i]] = queryResult.graph;
      cache = utils.mergeCache(cache, queryResult.cache);
    });
    return {graph: graph, cache: cache};
  });
}

function fetchQuery(env, cache, parent, query) {
  // console.log('fetchQuery', parent, query);
  const currentQuery = query[0];
  const subQuery = query[1];
  const pathSpec = currentQuery[0];
  const params = currentQuery[1] || {};
  const handlers = env.handlers;
  const fetchFunc = handlers[pathSpec];
  if (!fetchFunc) {
    throw new Error(`Undefined schema handler '${pathSpec}'`);
  }
  // console.log('fetchQuery', currentQuery, subQuery, relType, params, fetchFunc);
  return fetchFunc(env, cache, parent, params, subQuery);
}

function getAllPaths(graph) {
  let paths = [];
  paths.push(graph.$path);
  if (graph.$type === 'object') {
    for (let k in graph) {
      if (!k.match(/^\$/)) {
        paths = paths.concat(getAllPaths(graph[k]));
      }
    }
  } else {
    for (let k in graph.$data) {
      paths = paths.concat(getAllPaths(graph.$data[k]));
    }
  }
  return paths;
}


module.exports = {
  fetchQuery: fetchQuery,
  fetchCompositeQuery: fetchCompositeQuery,
  getAllPaths: getAllPaths
};
