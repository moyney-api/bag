import { MockDb } from '../../mockDb';

export default Object.freeze({
  basic_bag: {
    uid: 'basic_bag',
    name: 'Basic bag',
    userUid: 'user_send_test',
    amount: 50,
    received: {},
  },
  bag_send_with_limit: {
    uid: 'bag_send_with_limit',
    name: 'Sends with limit to basic',
    userUid: 'user_nested_test',
    amount: 20,
    received: {},
    rules: {
      oi: ['a:su2|t:basic_bag|l:200'],
    },
  },
  bag_without_limit_property: {
    uid: 'bag_without_limit_property',
    name: 'Sends without limit property',
    userUid: 'user_nested_test',
    amount: 20,
    received: {},
    rules: {
      oi: ['a:su2|t:basic_bag'],
    },
  },
}) as MockDb;
