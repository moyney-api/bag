import { lastValueFrom } from 'rxjs';
import { Bag } from '../../../src/models/bag';
import { Currency } from '../../../src/models/currency';
import { MoyFirestoreMock } from 'moy-firebase-manager';
import { spyOnCurrConverter } from '../../__mocks/utils.mock.spec';
import { admin } from '../../../src/firebase';
import FAKE_DB from '../../__mocks/dbs/models/currency.db';

const firestoreMock = new MoyFirestoreMock({ bags: FAKE_DB }, admin.firestore());
spyOnCurrConverter({ 'eur/usd': 2, 'usd/eur': 0.5 });

beforeEach(() => firestoreMock.reset());

describe('currency', () => {
  const { /*EUR*/btc_bag, /*BTC*/euro_bag, child_bag_2, grandchild_bag } = FAKE_DB;

  it('should change currency', async () => {
    const bag = new Bag(btc_bag);
    expect(firestoreMock.get(bag.uid).currency).toBe('BTC');

    await lastValueFrom(bag.changeCurrency(Currency.Euro).save());

    expect(firestoreMock.get(bag.uid).currency).toBe('EUR');
  });

  describe('currency change for nested', () => {
    it('should change currency of children and grandchildren', async () => {
      const bag = new Bag(euro_bag);

      expect(firestoreMock.get(bag.uid!).currency).toBe('EUR');
      expect(firestoreMock.get(child_bag_2.uid!).currency).toBe('EUR');
      expect(firestoreMock.get(grandchild_bag.uid!).currency).toBe('EUR');

      await lastValueFrom(bag.changeCurrency(Currency.USD).save());

      expect(firestoreMock.get(bag.uid!).currency).toBe('USD');
      expect(firestoreMock.get(child_bag_2.uid!).currency).toBe('USD');
      expect(firestoreMock.get(grandchild_bag.uid!).currency).toBe('USD');
    });

    it('should update amounts and totals of children and grandchildren', async () => {
      const bag = new Bag(euro_bag);

      await lastValueFrom(bag.changeCurrency(Currency.USD).save());

      expect(firestoreMock.get(bag.uid!).amount).toBe(euro_bag.amount! * 2);
      expect(firestoreMock.get(child_bag_2.uid!).amount).toBe(child_bag_2.amount! * 2);
      expect(firestoreMock.get(grandchild_bag.uid!).amount).toBe(grandchild_bag.amount! * 2);
    });
  });

  it('should error if trying to change to a currency that doesnt exist', async () => {
    const bag = new Bag(btc_bag);

    expect(firestoreMock.get(bag.uid).currency).toBe('BTC');

    try {
      await lastValueFrom(bag.changeCurrency('MOY' as Currency).save());
    } catch (e) {
      expect(() => { throw e }).toThrow();
    }
  });

  it('should not allow a change of currency if the bag has a parent', async () => {
    const bag = new Bag(child_bag_2);

    try {
      await lastValueFrom(bag.changeCurrency(Currency.USD).save());
    } catch (e) {
      expect(() => { throw e }).toThrow();
    }
  });

  it('should show the value in a different currency', async () => {
    const bag = new Bag(child_bag_2);

    const { amount, from, to } = await lastValueFrom(bag.amountInCurrency(Currency.USD));

    expect(amount).toBe(child_bag_2.amount! * 2);
    expect(from).toBe(Currency.Euro);
    expect(to).toBe(Currency.USD);
  });
});
