'use strict';

const fetchCompositeQuery = require('../lib/query').fetchCompositeQuery;
const getAllPaths = require('../lib/query').getAllPaths;
const generateHandlers = require('../lib/handlers').generateHandlers;
const schema = require('./server/schema');
const handlers = generateHandlers(schema, 'postgres');

const express = require('express');
const database = require('./server/database'),
  db = database.db;

const app = express();

app.get('/', (req, res) => {

  const query = {
    // users: [
    //   ['users', {filter: "email like '%@asdf.com'"}]
    // ],
    // user: [
    //   ['user', {id: 2}]
    // ],
    oneOrder: [
      ['order', {id: 2}],
      {
        items: [
          ['order->items']
        ],
        user: [
          ['order->user']
        ]
      }
    ],
    // kitchenSink: [
    //   ['user', {id: 1}],
    //   {
    //     orders: [
    //       ['user->orders', {limit: 2}],
    //       {
    //         user: [
    //           ['order->user']
    //         ],
    //         items: [
    //           ['order->items'],
    //           {
    //             order: [
    //               ['item->order']
    //             ]
    //           }
    //         ],
    //       }
    //     ]
    //   }
    // ]
  };

  return fetchCompositeQuery({db: db, schema: schema, handlers: handlers}, {}, null, query).then((result) => {
    let paths = {};
    for (let k in result.graph) {
      paths[k] = getAllPaths(result.graph[k]);
    }
    res.json({
      paths: paths,
      query: query,
      result:result
    });
  }).catch((err) => {
    res.send(err);
  });

});

const server = app.listen(3001, () => {
  let host = server.address().address;
  let port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
