'use strict';
const database = require('./server/database'),
  db = database.db,
  done = database.done;
const fs = require('fs');
const migrationsScript = fs.readFileSync('./scripts/server/migration.sql', 'utf8');

console.log('db:migrate starting');
db.any(migrationsScript).then(() => {
  console.log('db:migrate done');
}).catch((err) => {
  console.log('db:migrate error: %s', err);
}).finally(() => {
  done();
});
