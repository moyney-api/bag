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
      received: {},
      rules: {},
    },
    parent_changes_test: {
      uid: 'parent_changes_test',
      name: 'parent of bag 1',
      userUid: 'user_nested_test',
      currency: Currency.Bitcoin,
      amount: 100,
      received: {},
      rules: {},
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
      received: {},
      rules: {},
      belongsTo: 'parent_changes_test',
    },
    triple_nested_bag: {
      uid: 'triple_nested_bag',
      name: 'parent nested bag',
      userUid: 'user_nested_test',
      currency: Currency.Euro,
      amount: 300,
      received: {},
      rules: {},
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
      received: {},
      rules: {},
    },
    double_nested_bag_2: {
      uid: 'double_nested_bag_2',
      name: 'double nested sibling 2',
      userUid: 'user_nested_test',
      currency: Currency.Euro,
      amount: 50.32,
      received: {},
      rules: {},
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
      received: {},
      rules: {},
      belongsTo: 'double_nested_bag_2',
    },
    // Sending
    bag_sends_1_to_most_basic: {
      uid: 'bag_sends_1_to_most_basic',
      name: 'bag sends 1 to most basic',
      userUid: 'user_nested_test',
      currency: Currency.Bitcoin,
      amount: 20,
      received: {},
      rules: {
        oi: ['a:s|t:most_basic_bag|l:1'],
      },
    },
    bag_sends_all_to_most_basic: {
      uid: 'bag_sends_all_to_most_basic',
      name: 'bag sends all to most basic',
      userUid: 'user_nested_test',
      currency: Currency.Bitcoin,
      amount: 20,
      received: {},
      rules: {
        oi: ['a:s|t:most_basic_bag'],
      },
    },
    // Sending up to
    bag_send_with_limit: {
      uid: 'bag_send_with_limit',
      name: 'bag sends with limit to most basic',
      userUid: 'user_nested_test',
      currency: Currency.Bitcoin,
      amount: 20,
      received: {},
      rules: {
        oi: ['a:su2|t:most_basic_bag|l:200'],
      },
    },
    bag_send_without_limit_property: {
      uid: 'bag_without_limit_property',
      name: 'bag sends without limit property',
      userUid: 'user_nested_test',
      currency: Currency.Bitcoin,
      amount: 20,
      received: {},
      rules: {
        oi: ['a:su2|t:most_basic_bag'],
      },
    },
    // Taking
    bag_takes_from_above_bag: {
      uid: 'bag_takes_from_above_bag',
      name: 'bag takes form above bag',
      userUid: 'user_nested_test',
      currency: Currency.Bitcoin,
      amount: 20,
      received: {},
      rules: {
        oo: ['a:t|t:bag_sends_all_to_most_basic']
      }
    },
    bag_takes_fifty_percent: {
      uid: 'bag_takes_fifty_percent',
      name: 'bag takes fifty percent',
      userUid: 'user_nested_test',
      currency: Currency.Bitcoin,
      amount: 20,
      received: {},
      rules: {
        oo: ['a:t|t:bag_sends_all_to_most_basic|l:50%']
      }
    },
    // Taking up to
    bag_take_with_limit: {
      uid: 'bag_take_with_limit',
      name: 'bag takes with limit to most basic',
      userUid: 'user_nested_test',
      currency: Currency.Bitcoin,
      amount: 20,
      received: {},
      rules: {
        oo: ['a:tu2|t:most_basic_bag|l:20'],
      },
    },
    bag_take_without_limit_property: {
      uid: 'bag_without_limit_property',
      name: 'bag sends without limit property',
      userUid: 'user_nested_test',
      currency: Currency.Bitcoin,
      amount: 20,
      received: {},
      rules: {
        oo: ['a:tu2|t:most_basic_bag'],
      },
    },
  }
});
