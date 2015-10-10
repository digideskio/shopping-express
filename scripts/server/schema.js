'use strict';

const schema = {
  'user': {
    collectionName: 'users',
    tableName: 'users',
    relationships: {
      orders: { schemaName: 'order', type: 'hasMany', fk: 'user_id' }
    }
  },
  'order': {
    collectionName: 'orders',
    tableName: 'orders',
    relationships: {
      items: { schemaName: 'item', type: 'hasMany', fk: 'order_id' },
      user: { schemaName: 'user', type: 'belongsTo', fk: 'user_id' }
    }
  },
  'item': {
    collectionName: 'items',
    tableName: 'items',
    relationships: {
      order: { schemaName: 'order', type: 'belongsTo', fk: 'order_id' }
    }
  }
}

/*
  schema should generate handlers:
  {
    'users': backend.collectionFetcher('user'),
    'user': backend.objectFetcher('user'),
    'user->orders': backend.collectionFetcher('order'),

    'orders': backend.collectionFetcher('order'),
    'order': backend.objectFetcher('order'),
    'order->items': backend.collectionFetcher('item'),
    'order->user': backend.objectFetcher('user'),

    'items': backend.collectionFetcher('item'),
    'item': backend.objectFetcher('item'),
    'item->order': backend.objectFetcher('order')
  };
*/

module.exports = schema;
