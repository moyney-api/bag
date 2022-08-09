import { Currency } from '../../../../src/models/currency';
import { MockDb } from '../../mockDb';

export default Object.freeze({
  father_bag: {
    uid: 'father_bag',
    name: 'Father bag',
    userUid: 'user_nested_test',
    currency: Currency.Euro,
    amount: 300,
    received: {},
    rules: {},
    children: {
      sibling_bag_1: {
        name: 'sibling_bag_1',
        amount: 75,
      },
      sibling_bag_2: {
        name: 'sibling_bag_2',
        amount: 75.32,
      }
    }
  },
  sibling_bag_1: {
    uid: 'sibling_bag_1',
    name: 'Sibling bag one',
    userUid: 'user_nested_test',
    currency: Currency.Euro,
    amount: 75,
    received: {},
    rules: {},
  },
  sibling_bag_2: {
    uid: 'sibling_bag_2',
    name: 'Sibling bag two',
    userUid: 'user_nested_test',
    currency: Currency.Euro,
    amount: 50.32,
    received: {},
    rules: {},
    children: {
      child_bag: {
        name: 'Child bag',
        amount: 25,
      },
    },
    belongsTo: 'father_bag'
  },
  child_bag: {
    uid: 'child_bag',
    name: 'Child bag',
    userUid: 'user_nested_test',
    currency: Currency.Euro,
    amount: 25,
    received: {},
    rules: {},
    belongsTo: 'sibling_bag_2',
  },
}) as MockDb;
