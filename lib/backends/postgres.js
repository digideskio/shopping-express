'use strict';
const utils = require('../utils'),
  merge = utils.merge,
  mergeCache = utils.mergeCache,
  makeCollection = utils.makeCollection,
  addToCollection = utils.addToCollection,
  makeObject = utils.makeObject;
const fetchCompositeQuery = require('../query').fetchCompositeQuery;
const extend = require('extend');


function objectFetcher(entityName) {
  return function(env, cache, parent, params, query) {
    // console.log('fetching object %s', entityName);
    const db = env.db;
    const schema = env.schema;
    const tableName = schema[entityName].tableName;

    let objectId;
    if (parent) {
      const relationship = _getRelationship(schema, parent, entityName);
      if (!relationship) {
        throw new Error(`Invalid relationship ${parent.$path[0]} -> ${entityName}`);
      }
      objectId = cache[parent.$path[0]][parent.$path[1]][relationship.fk];
    } else {
      objectId = params.id
    }

    let sql = `
      select *
      from ${tableName}
      where id = ${objectId}
      limit 1
    `;

    let graph;
    return db.one(sql).then((result) => {
      cache = merge(cache, entityName, result.id, result);
      graph = makeObject({path: [entityName, result.id]});

      if (query) {
        return fetchCompositeQuery(env, cache, graph, query).then((result) => {
          cache = mergeCache(cache, result.cache);
          graph = extend(graph, result.graph);
          return {cache: cache, graph: graph};
        });
      } else {
        return {cache: cache, graph: graph};
      }
    });
  }
}

function collectionFetcher(entityName) {
  return function(env, cache, parent, params, query) {
    // console.log('fetching collection %s [%s]', entityName, pathName);
    const db = env.db;
    const schema = env.schema;
    const tableName = schema[entityName].tableName;
    const pathName = schema[entityName].collectionName;

    let baseSql;
    if (parent) {
      baseSql = `
        select *
        from ${tableName}
        where ${_makeJoinClause(schema, parent, pathName)} ${params.filter ? 'and ' + params.filter : ''}
        order by ${params.sort || 'id'}
      `;
    } else {
      baseSql = `
        select *
        from users ${params.filter ? 'where ' + params.filter : ''}
        order by ${params.sort || 'id'}
      `;
    }

    let countingSql = `
      select count(*)::int cnt
      from (${baseSql}) a
    `;
    let sql  = `
      select *
      from (${baseSql}) a
      limit ${params.limit || 'all'} offset ${params.offset || '0'}
    `;

    let graph;
    return db.one(countingSql).then((result) => {
      let path = parent ? parent.$path.slice(0) : [];
      path.push(pathName);

      graph = makeCollection({path: path, params: params, meta: {'total': result.cnt}});

      return db.many(sql).then((results) => {
        results.forEach((result) => {
          cache = merge(cache, entityName, result.id, result);
          addToCollection(graph, makeObject({path: [entityName, result.id]}));
        });

        if (query) {
          let promises = [];
          graph.$data.forEach((subGraph) => {
            promises.push(fetchCompositeQuery(env, cache, subGraph, query));
          });
          return Promise.all(promises).then((results) => {
            results.forEach((result, index) => {
              extend(graph.$data[index], result.graph);
              cache = mergeCache(cache, result.cache);
            });
            return {cache: cache, graph: graph};
          });
        } else {
          return {cache: cache, graph: graph};
        }
      });
    });
  }
}

function _makeJoinClause(schema, ref, relName) {
  const relationship = _getRelationship(schema, ref, relName);
  if (!relationship) {
    throw new Error(`Invalid relationship ${ref.$path[0]} -> ${relName}`);
  }

  if (relationship.type === 'hasMany' || relationship.type === 'hasOne') {
    return `${relationship.fk} = ${ref.$path[1]}`;
  }
  throw new Error(`Join not implemented for ${relationship.type}, ${ref.$path[0]} -> ${relName}`);
}

function _getRelationship(schema, ref, relName) {
  const entity = schema[ref.$path[0]] || {relationships: {}};
  return entity.relationships[relName];
}

module.exports = {
  objectFetcher: objectFetcher,
  collectionFetcher: collectionFetcher
};
