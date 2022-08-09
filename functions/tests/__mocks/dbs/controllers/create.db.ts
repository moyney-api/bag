import { MockDb } from '../../mockDb';

export const bagWithBelongsToParams = {
  name: 'On creation should update the other bag',
  userUid: 'user_create_test',
  amount: 20,
  belongsTo: 'made_up_bag',
};

export default Object.freeze({
  made_up_bag: {
    uid: 'made_up_bag',
    name: 'I made this up',
    userUid: 'user_create_test',
    amount: -30,
  },
  receiving_bag: {
    userUid: 'user_create_test',
  },
}) as MockDb;
