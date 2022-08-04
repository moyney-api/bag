import { lastValueFrom } from 'rxjs';
import { Bag } from '../../../../src/models/bag';
import { MoyFirestoreMock } from 'moy-firebase-manager';
import { FAKE_BAG_DB } from '../../../__mocks/mockDb';

const firestoreMock = new MoyFirestoreMock(FAKE_BAG_DB);
beforeEach(() => firestoreMock.reset());

describe('Sending up to', () => {
  const { bag_send_with_limit, most_basic_bag, bag_send_without_limit_property } = FAKE_BAG_DB.bags;

  it('should send to another bag on income', async () => {
    const bag = new Bag(bag_send_with_limit);

    expect(firestoreMock.get(bag.uid).amount).toBe(bag_send_with_limit.amount);

    await lastValueFrom(bag.setAmount(bag.amount + 220).save());

    expect(firestoreMock.get(bag.uid).amount).toBe(bag_send_with_limit.amount + 20);
    expect(firestoreMock.get(most_basic_bag.uid).amount).toBe(most_basic_bag.amount + 200);
  });

  it('should send 0 if limit has been reached', async () => {
    const bag = new Bag(bag_send_with_limit);

    expect(firestoreMock.get(bag.uid).amount).toBe(bag_send_with_limit.amount)

    await (lastValueFrom(bag.setAmount(bag.amount + 100).save()));
    await (lastValueFrom(bag.setAmount(bag.amount + 200).save()));

    expect(firestoreMock.get(bag.uid).amount).toBe(bag_send_with_limit.amount + 100);
    expect(firestoreMock.get(most_basic_bag.uid).amount).toBe(most_basic_bag.amount + 200);

    await (lastValueFrom(bag.setAmount(bag.amount + 10).save()));

    expect(firestoreMock.get(bag.uid).amount).toBe(bag_send_with_limit.amount + 110);
    expect(firestoreMock.get(most_basic_bag.uid).amount).toBe(most_basic_bag.amount + 200);
  });

  it('should error if su2 rule has no limit property', async () => {
    const bag = new Bag(bag_send_without_limit_property);

    try {
      await (lastValueFrom(bag.setAmount(bag.amount - 100).save()));
    } catch (e) {
      expect(() => { throw e }).toThrow();
    }
  });
});
