import { MockDb } from '../../mockDb';

export default Object.freeze({
  basic_bag: {
    uid: 'basic_bag',
    name: 'Basic bag',
    userUid: 'user_send_test',
    amount: 500,
  },
  bag_takes_from_above_bag: {
    uid: 'bag_takes_from_above_bag',
    name: 'bag takes form above bag',
    userUid: 'user_nested_test',
    amount: 20,
    received: {},
    rules: {
      oo: ['a:t|t:basic_bag']
    }
  },
  bag_takes_fifty_percent: {
    uid: 'bag_takes_fifty_percent',
    name: 'bag takes fifty percent',
    userUid: 'user_nested_test',
    amount: 20,
    received: {},
    rules: {
      oo: ['a:t|t:basic_bag|l:50%']
    }
  },
}) as MockDb;
