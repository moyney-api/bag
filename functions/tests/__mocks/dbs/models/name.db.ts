// import { Currency } from '../../../src/models/currency';

import { MockDb } from '../../mockDb';

export default Object.freeze({
  basic_bag: {
    uid: 'basic_bag',
    name: 'Basic bag',
    userUid: 'user_name_test',
  },
  parent_bag: {
    uid: 'parent_bag',
    name: 'Parent bag',
    userUid: 'user_name_test',
    children: {
      child_bag: {
        name: 'Child bag',
        amount: 0,
      }
    }
  },
  child_bag: {
    uid: 'child_bag',
    name: 'Child bag',
    userUid: 'user_name_test',
    belongsTo: 'parent_bag',
  }
}) as MockDb;
