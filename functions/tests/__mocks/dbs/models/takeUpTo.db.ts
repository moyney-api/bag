import { MockDb } from '../../mockDb';

export default Object.freeze({
  basic_bag: {
    uid: 'basic_bag',
    name: 'Basic bag',
    userUid: 'user_send_test',
    amount: 500,
    received: {},
  },
  bag_take_with_limit: {
    uid: 'bag_take_with_limit',
    name: 'bag takes with limit to most basic',
    userUid: 'user_nested_test',
    amount: 20,
    received: {},
    rules: {
      oo: ['a:tu2|t:basic_bag|l:20'],
    },
  },
  bag_without_limit_property: {
    uid: 'bag_without_limit_property',
    name: 'bag sends without limit property',
    userUid: 'user_nested_test',
    amount: 20,
    received: {},
    rules: {
      oo: ['a:tu2|t:basic_bag'],
    },
  },
}) as MockDb;
