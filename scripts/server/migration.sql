drop table if exists users;

create table users (
  id serial primary key,
  name varchar,
  email varchar
);

drop table if exists orders;

create table orders (
  id serial primary key,
  shipping float,
  user_id integer
);

drop table if exists items;

create table items (
  id serial primary key,
  name varchar,
  price float,
  amount integer,
  order_id integer
);

insert into users
(id, name, email)
values
(1, 'user1', 'user1@asdf.com'),
(2, 'user2', 'user2@asdf.com'),
(3, 'user3', 'user3@asdf.com');

insert into orders
(id, shipping, user_id)
values
(1, 0.95, 1),
(2, 1.95, 1),
(3, 2.95, 2),
(4, 0.95, 2);

insert into items
(id, name, price, amount, order_id)
values
(1, 'item 1', 1.95, 2, 1),
(2, 'item 2', 0.95, 5, 1),

(3, 'item 3', 2.95, 10, 2),
(4, 'item 4', 3.95, 5, 2),

(5, 'item 5', 3.15, 5, 3),
(6, 'item 6', 3.25, 5, 3),
(7, 'item 7', 3.35, 5, 3),
(8, 'item 8', 3.45, 5, 3),
(9, 'item 9', 3.55, 5, 3),

(10, 'item 10', 10.95, 3, 4),
(11, 'item 11', 5.95, 15, 4),
(12, 'item 12', 1.95, 20, 4);
