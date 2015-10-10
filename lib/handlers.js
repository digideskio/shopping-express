'use strict';

function generateHandlers(schema, backendName) {
  const backend = require(`./backends/${backendName}`);
  let handlers = {};

  for (let k in schema) {
    handlers[schema[k].collectionName] = backend.collectionFetcher(k);
    handlers[k] = backend.objectFetcher(k);
    for (let r in schema[k].relationships) {
      let rel = schema[k].relationships[r];
      if (rel.type === 'hasMany') {
        handlers[`${k}->${r}`] = backend.collectionFetcher(rel.schemaName);
      } else {
        handlers[`${k}->${r}`] = backend.objectFetcher(rel.schemaName);
      }
    }
  }
  return handlers;
}



module.exports = {
  generateHandlers: generateHandlers
};
