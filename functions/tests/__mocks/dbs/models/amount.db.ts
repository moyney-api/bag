import { Currency } from '../../../../src/models/currency';
import { MockDb } from '../../mockDb';

export default Object.freeze({
  parent_bag: {
    uid: 'parent_bag',
    name: 'Parent bag',
    userUid: 'user_nested_test',
    currency: Currency.Euro,
    amount: 100,
    received: {},
    rules: {},
    children: {
      child_bag: {
        name: 'bag 1',
        amount: 100,
      }
    }
  },
  child_bag: {
    uid: 'child_bag',
    name: 'Child bag',
    userUid: 'user_nested_test',
    currency: Currency.Euro,
    amount: 100,
    received: {},
    rules: {},
    belongsTo: 'parent_bag',
  },
}) as MockDb;
