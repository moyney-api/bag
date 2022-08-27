import { Currency } from '../../../../src/models/currency';
import { MockDb } from '../../mockDb';

export default Object.freeze({
  most_basic_bag: {
    uid: 'most_basic_bag',
    name: 'simple bag',
    userUid: 'bag_user',
    currency: Currency.Bitcoin,
    amount: 0,
    received: {},
    rules: {},
  },
}) as MockDb;
