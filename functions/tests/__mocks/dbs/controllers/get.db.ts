import { MockDb } from '../../mockDb';

export default Object.freeze({
  some_bag: {
    uid: 'some_bag',
    name: 'I should be gotten :)!',
    userUid: 'user_create_test',
    amount: -30,
    belongsTo: 'parent_bag'
  },
  parent_bag: {
    userUid: 'user_create_test',
    children: {
      some_bag: {
        name: 'I should be gotten :)!',
        amount: -30,
      }
    }
  },
}) as MockDb;
