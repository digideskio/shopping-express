'use strict';
const database = require('./server/database'),
  db = database.db,
  done = database.done;
const fs = require('fs');
const cleanupScript = fs.readFileSync('./scripts/server/cleanup.sql', 'utf8');

console.log('db:cleanup starting');
db.any(cleanupScript).then(() => {
  console.log('db:cleanup done');
}).catch((err) => {
  console.log('db:cleanup error: %s', err);
}).finally(() => {
  done();
});
