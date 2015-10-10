'use strict';
const pgp = require('pg-promise')();
const DB_CONNECTION_STR = 'postgres://shopping_express_dev:shopping_express_dev@localhost:5432/shopping_express_dev';
const db = pgp(DB_CONNECTION_STR);

module.exports = {
  db: db,
  done: pgp.end
}
