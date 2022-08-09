import { MockDb } from '../../mockDb';

export default Object.freeze({
  basic_bag: {
    uid: 'basic_bag',
    name: 'Basic bag',
    userUid: 'user_send_test',
  },
  bag_sends_5_to_most_basic: {
    uid: 'bag_sends_5_to_most_basic',
    name: 'bag sends 5 to most basic',
    userUid: 'user_send_test',
    amount: 20,
    received: {},
    rules: {
      oi: ['a:s|t:basic_bag|l:5'],
    },
  },
  bag_sends_all_to_most_basic: {
    uid: 'bag_sends_all_to_most_basic',
    name: 'bag sends all to most basic',
    userUid: 'user_send_test',
    amount: 20,
    received: {},
    rules: {
      oi: ['a:s|t:basic_bag'],
    },
  },
}) as MockDb;
