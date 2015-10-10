'use strict';
const expect = require('chai').expect;
const fs = require('fs');

describe('graph', function() {
  const pgp = require('pg-promise')({
    // query: function (e) { console.log("Query:", e.query); }
  });
  const DB_CONNECTION_STR = 'postgres://shopping_express_test:shopping_express_test@localhost:5432/shopping_express_test';
  const db = pgp(DB_CONNECTION_STR);

  const fetchCompositeQuery = require('../lib/query').fetchCompositeQuery;
  const generateHandlers = require('../lib/handlers').generateHandlers;
  const schema = require('./fixtures/schema');
  const handlers = generateHandlers(schema, 'postgres');

  before(() => {
    return db.any(fs.readFileSync('./test/fixtures/setup.sql', 'utf8'));
  });

  after(() => {
    return db.any(fs.readFileSync('./test/fixtures/teardown.sql', 'utf8'));
  });

  it('unnested object', (done) => {
    const query = {
      user: [
        ['user', {id: 1}]
      ]
    };

    fetchCompositeQuery({db: db, schema: schema, handlers: handlers}, {}, null, query).then((result) => {
      expect(result).to.deep.equal({
        graph: {
          user: {
            $type: 'object',
            $path: ['user', 1]
          }
        },
        cache: {
          user: {
            1: {
              id: 1,
              name: 'user1',
              email: 'user1@asdf.com'
            }
          }
        }
      });
      done();
    }).catch(done);
  });

  it('unnested collection', (done) => {
    const query = {
      users: [
        ['users']
      ]
    };

    fetchCompositeQuery({db: db, schema: schema, handlers: handlers}, {}, null, query).then((result) => {
      expect(result).to.deep.equal({
        graph: {
          users: {
            $type: 'collection',
            $path: ['users'],
            $params: {},
            $data: [
              { $type: 'object', $path: ['user', 1] },
              { $type: 'object', $path: ['user', 2] },
              { $type: 'object', $path: ['user', 3] }
            ],
            $meta: {
              total: 3,
              limit: null,
              offset: 0
            }
          }
        },
        cache: {
          user: {
            1: {
              id: 1,
              name: 'user1',
              email: 'user1@asdf.com'
            },
            2: {
              id: 2,
              name: 'user2',
              email: 'user2@asdf.com'
            },
            3: {
              id: 3,
              name: 'user3',
              email: 'user3@asdf.com'
            }
          }
        }
      });
      done();
    }).catch(done);
  });

  it('nested object -> collection', (done) => {
    const query = {
      user: [
        ['user', {id: 1}],
        {
          orders: [
            ['user->orders', {limit: 2}],
            {
              user: [
                ['order->user']
              ],
              items: [
                ['order->items'],
                {
                  order: [
                    ['item->order']
                  ]
                }
              ],
            }
          ]
        }
      ]
    };

    fetchCompositeQuery({db: db, schema: schema, handlers: handlers}, {}, null, query).then((result) => {
      expect(result).to.deep.equal({
        graph: {
          user: {
            $type: 'object',
            $path: ['user', 1],
            orders: {
              $type: 'collection',
              $path: ['user', 1, 'orders'],
              $params: { limit: 2 },
              $meta: { total: 2, limit: 2, offset: 0 },
              $data: [
                {
                  $type: 'object',
                  $path: ['order', 1],
                  user: {
                    $type: 'object',
                    $path: ['user', 1]
                  },
                  items: {
                    $type: 'collection',
                    $path: ['order', 1, 'items'],
                    $params: { },
                    $meta: { total: 2, limit: null, offset: 0 },
                    $data: [
                      {
                        $type: 'object',
                        $path: ['item', 1],
                        order: { $type: 'object', $path: ['order', 1] }
                      },
                      {
                        $type: 'object',
                        $path: ['item', 2],
                        order: { $type: 'object', $path: ['order', 1] }
                      }
                    ],
                  }
                },
                {
                  $type: 'object',
                  $path: ['order', 2],
                  user: {
                    $type: 'object',
                    $path: ['user', 1]
                  },
                  items: {
                    $type: 'collection',
                    $path: ['order', 2, 'items'],
                    $params: { },
                    $meta: { total: 2, limit: null, offset: 0 },
                    $data: [
                      {
                        $type: 'object',
                        $path: ['item', 3],
                        order: { $type: 'object', $path: ['order', 2] }
                      },
                      {
                        $type: 'object',
                        $path: ['item', 4],
                        order: { $type: 'object', $path: ['order', 2] }
                      }
                    ]
                  }
                }
              ]
            }
          }
        },
        cache: {
          user: {
            1: {
              id: 1,
              name: 'user1',
              email: 'user1@asdf.com'
            }
          },
          order: {
            1: {
              id: 1,
              shipping: 0.95,
              user_id: 1
            },
            2: {
              id: 2,
              shipping: 1.95,
              user_id: 1
            }
          },
          item: {
            1: {
              id: 1,
              name: 'item 1',
              price: 1.95,
              amount: 2,
              order_id: 1
            },
            2: {
              id: 2,
              name: 'item 2',
              price: 0.95,
              amount: 5,
              order_id: 1
            },
            3: {
              id: 3,
              name: 'item 3',
              price: 2.95,
              amount: 10,
              order_id: 2
            },
            4: {
              id: 4,
              name: 'item 4',
              price: 3.95,
              amount: 5,
              order_id: 2
            },
          }
        }
      });
      done();
    }).catch(done);
  });
});
