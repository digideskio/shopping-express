# An Easier GraphQL like implementation, with perhaps better mutations

See tests for examples.

## Why?

- GraphQL/Relay is too complicated
- Want to use it with postgres or other sql db
- (Not sure how mutation affects client side cache invalidation)

This could solve all the problem above.

## How?

- Disallow fetching partial entity. Partial fetching does not save that much bandwidth.
  In case of large text field, refactor into a related model (which is much easier
  to deal with given GraphQL like capability).
- Record materialized paths (TODO, explain). This allows cache invalidation for
  all graph queries after normal mutations such as add/remove/update table rows
