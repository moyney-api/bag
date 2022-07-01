import { BagData } from '../../src/models/bag';
import { Currency } from '../../src/models/currency';

type FakeBagDb = { bags: { [id: string]: BagData } };
export const FAKE_BAG_DB: Readonly<FakeBagDb> = Object.freeze({
  bags: {
    most_basic_bag: {
      uid: 'most_basic_bag',
      name: 'simple bag',
      userUid: 'user_nested_test',
      currency: Currency.Bitcoin,
      amount: 0,
      rules: [],
    },
    parent_changes_test: {
      uid: 'parent_changes_test',
      name: 'parent of bag 1',
      userUid: 'user_nested_test',
      currency: Currency.Bitcoin,
      amount: 100,
      rules: [],
      children: {
        basic_update_bag: {
          name: 'bag 1',
          amount: 100,
        }
      }
    },
    basic_update_bag: {
      uid: 'basic_update_bag',
      name: 'bag 1',
      userUid: 'user_nested_test',
      currency: Currency.Bitcoin,
      amount: 100,
      rules: [],
      belongsTo: 'parent_changes_test',
    },
    triple_nested_bag: {
      uid: 'triple_nested_bag',
      name: 'parent nested bag',
      userUid: 'user_nested_test',
      currency: Currency.Euro,
      amount: 300,
      rules: [],
      children: {
        double_nested_bag_1: {
          name: 'double_nested_bag_1',
          amount: 75,
        },
        double_nested_bag_2: {
          name: 'double_nested_bag_2',
          amount: 75.32,
        }
      }
    },
    double_nested_bag_1: {
      uid: 'double_nested_bag_1',
      name: 'double nested sibling 1',
      userUid: 'user_nested_test',
      currency: Currency.Euro,
      amount: 75,
      rules: [],
    },
    double_nested_bag_2: {
      uid: 'double_nested_bag_2',
      name: 'double nested sibling 2',
      userUid: 'user_nested_test',
      currency: Currency.Euro,
      amount: 50.32,
      rules: [],
      children: {
        single_nested_bag: {
          name: 'single nested bag 1',
          amount: 25,
        },
      },
      belongsTo: 'triple_nested_bag'
    },
    single_nested_bag: {
      uid: 'single_nested_bag',
      name: 'single nested bag 1',
      userUid: 'user_nested_test',
      currency: Currency.Euro,
      amount: 25,
      rules: [],
      belongsTo: 'double_nested_bag_2',
    }
  }
});
