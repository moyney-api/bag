import { lastValueFrom } from 'rxjs';
import { Bag } from '../../../../src/models/bag';
import { FirestoreMock } from '../../../__mocks/firestore.mock.spec';
import { FAKE_BAG_DB } from '../../../__mocks/mockDb';

const firestoreMock = new FirestoreMock(FAKE_BAG_DB);
beforeEach(() => firestoreMock.reset());

describe('Taking up to', () => {
  const { bag_take_with_limit, most_basic_bag, bag_take_without_limit_property } = FAKE_BAG_DB.bags;

  it('should take from bag on outcome', async () => {
    const bag = new Bag(bag_take_with_limit);

    expect(firestoreMock.get(bag.uid).amount).toBe(bag_take_with_limit.amount);

    await lastValueFrom(bag.setAmount(bag.amount - 20).save());

    expect(firestoreMock.get(bag.uid).amount).toBe(bag_take_with_limit.amount);
    expect(firestoreMock.get(most_basic_bag.uid).amount).toBe(most_basic_bag.amount - 20);
  });

  it('should take 0 if limit has been reached', async () => {
    const bag = new Bag(bag_take_with_limit);

    expect(firestoreMock.get(bag.uid).amount).toBe(bag_take_with_limit.amount)

    await (lastValueFrom(bag.setAmount(bag.amount - 20).save()));

    expect(firestoreMock.get(bag.uid).amount).toBe(bag_take_with_limit.amount);
    expect(firestoreMock.get(most_basic_bag.uid).amount).toBe(most_basic_bag.amount - 20);

    await (lastValueFrom(bag.setAmount(bag.amount - 10).save()));

    expect(firestoreMock.get(bag.uid).amount).toBe(bag_take_with_limit.amount - 10);
    expect(firestoreMock.get(most_basic_bag.uid).amount).toBe(most_basic_bag.amount - 20);
  });

  it('should error if tu2 rule has no limit property', async () => {
    const bag = new Bag(bag_take_without_limit_property);

    try {
      await (lastValueFrom(bag.setAmount(bag.amount + 100).save()));
    } catch (e) {
      expect(() => { throw e }).toThrow();
    }
  });
});
