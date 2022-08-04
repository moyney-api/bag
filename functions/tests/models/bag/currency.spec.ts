import { lastValueFrom } from 'rxjs';
import { Bag } from '../../../src/models/bag';
import { Currency } from '../../../src/models/currency';
import { MoyFirestoreMock } from 'moy-firebase-manager';
import { FAKE_BAG_DB } from '../../__mocks/mockDb';
import { spyOnCurrConverter } from '../../__mocks/utils.mock.spec';

const firestoreMock = new MoyFirestoreMock(FAKE_BAG_DB);
spyOnCurrConverter({ 'eur/usd': 2, 'usd/eur': 0.5 });

beforeEach(() => firestoreMock.reset());

describe('currency', () => {
  const { /*BTC*/most_basic_bag, /*EUR*/triple_nested_bag, double_nested_bag_2, single_nested_bag } = FAKE_BAG_DB.bags;

  it('should change currency', async () => {
    const bag = new Bag(most_basic_bag);
    expect(firestoreMock.get(bag.uid).currency).toBe('BTC');

    await lastValueFrom(bag.changeCurrency(Currency.Euro).save());

    expect(firestoreMock.get(bag.uid).currency).toBe('EUR');
  });

  describe('currency change for nested', () => {
    it('should change currency of children and grandchildren', async () => {
      const bag = new Bag(triple_nested_bag);

      expect(firestoreMock.get(bag.uid).currency).toBe('EUR');
      expect(firestoreMock.get(double_nested_bag_2.uid).currency).toBe('EUR');
      expect(firestoreMock.get(single_nested_bag.uid).currency).toBe('EUR');

      await lastValueFrom(bag.changeCurrency(Currency.USD).save());

      expect(firestoreMock.get(bag.uid).currency).toBe('USD');
      expect(firestoreMock.get(double_nested_bag_2.uid).currency).toBe('USD');
      expect(firestoreMock.get(single_nested_bag.uid).currency).toBe('USD');
    });

    it('should update amounts and totals of children and grandchildren', async () => {
      const bag = new Bag(triple_nested_bag);

      await lastValueFrom(bag.changeCurrency(Currency.USD).save());

      expect(firestoreMock.get(bag.uid).amount).toBe(triple_nested_bag.amount * 2);
      expect(firestoreMock.get(double_nested_bag_2.uid).amount).toBe(double_nested_bag_2.amount * 2);
      expect(firestoreMock.get(single_nested_bag.uid).amount).toBe(single_nested_bag.amount * 2);
    });
  });

  it('should error if trying to change to a currency that doesnt exist', async () => {
    const bag = new Bag(most_basic_bag);

    expect(firestoreMock.get(bag.uid).currency).toBe('BTC');

    try {
      await lastValueFrom(bag.changeCurrency('MOY' as Currency).save());
    } catch (e) {
      expect(() => { throw e }).toThrow();
    }
  });

  it('should not allow a change of currency if the bag has a parent', async () => {
    const bag = new Bag(double_nested_bag_2);

    try {
      await lastValueFrom(bag.changeCurrency(Currency.USD).save());
    } catch (e) {
      expect(() => { throw e }).toThrow();
    }
  });

  it('should show the value in a different currency', async () => {
    const bag = new Bag(double_nested_bag_2);

    const { amount, from, to } = await lastValueFrom(bag.amountInCurrency(Currency.USD));

    expect(amount).toBe(double_nested_bag_2.amount * 2);
    expect(from).toBe(Currency.Euro);
    expect(to).toBe(Currency.USD);
  });
});
