import { Currency } from '../../../../src/models/currency';
import { MockDb } from '../../mockDb';

export default Object.freeze({
  btc_bag: {
    uid: 'btc_bag',
    name: 'Basic bag',
    userUid: 'user_nested_test',
    currency: Currency.Bitcoin,
    amount: 200,
  },
  euro_bag: {
    uid: 'euro_bag',
    name: 'Bitcoin bag',
    userUid: 'user_nested_test',
    currency: Currency.Euro,
    amount: 300,
    received: {},
    rules: {},
    children: {
      child_bag_1: {
        name: 'Child bag one',
        amount: 75,
      },
      child_bag_2: {
        name: 'Child bag two',
        amount: 75.32,
      }
    }
  },
  child_bag_1: {
    uid: 'child_bag_1',
    name: 'Child bag one',
    userUid: 'user_nested_test',
    currency: Currency.Euro,
    amount: 75,
    received: {},
    rules: {},
    belongsTo: 'euro_bag',
  },
  child_bag_2: {
    uid: 'child_bag_2',
    name: 'Child bag two',
    userUid: 'user_nested_test',
    currency: Currency.Euro,
    amount: 50.32,
    received: {},
    rules: {},
    children: {
      grandchild_bag: {
        name: 'Grandchild bag',
        amount: 25,
      },
    },
    belongsTo: 'euro_bag'
  },
  grandchild_bag: {
    uid: 'grandchild_bag',
    name: 'Grandchild bag',
    userUid: 'user_nested_test',
    currency: Currency.Euro,
    amount: 25,
    received: {},
    rules: {},
    belongsTo: 'child_bag_2',
  },
}) as MockDb;
