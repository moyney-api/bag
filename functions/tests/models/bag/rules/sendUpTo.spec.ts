import { lastValueFrom } from 'rxjs';
import { Bag } from '../../../../src/models/bag';
import { MoyFirestoreMock } from 'moy-firebase-manager';
import { admin } from '../../../../src/firebase';
import FAKE_DB from '../../../__mocks/dbs/models/sendUpTo.db';

const firestoreMock = new MoyFirestoreMock({ bags: FAKE_DB }, admin.firestore());
beforeEach(() => firestoreMock.reset());

describe('Sending up to', () => {
  const { bag_send_with_limit, bag_without_limit_property, basic_bag } = FAKE_DB;

  it('should send to another bag on income', async () => {
    const bag = new Bag(bag_send_with_limit);

    expect(firestoreMock.get(bag.uid).amount).toBe(bag_send_with_limit.amount);

    await lastValueFrom(bag.setAmount(bag.amount + 220).save());

    expect(firestoreMock.get(bag.uid).amount).toBe(bag_send_with_limit.amount! + 20);
    expect(firestoreMock.get(basic_bag.uid!).amount).toBe(basic_bag.amount! + 200);
  });

  it('should send 0 if limit has been reached', async () => {
    const bag = new Bag(bag_send_with_limit);

    expect(firestoreMock.get(bag.uid).amount).toBe(bag_send_with_limit.amount)

    await (lastValueFrom(bag.setAmount(bag.amount + 100).save()));
    await (lastValueFrom(bag.setAmount(bag.amount + 200).save()));

    expect(firestoreMock.get(bag.uid).amount).toBe(bag_send_with_limit.amount! + 100);
    expect(firestoreMock.get(basic_bag.uid!).amount).toBe(basic_bag.amount! + 200);

    await (lastValueFrom(bag.setAmount(bag.amount + 10).save()));

    expect(firestoreMock.get(bag.uid).amount).toBe(bag_send_with_limit.amount! + 110);
    expect(firestoreMock.get(basic_bag.uid!).amount).toBe(basic_bag.amount! + 200);
  });

  it('should error if su2 rule has no limit property', async () => {
    const bag = new Bag(bag_without_limit_property);

    try {
      await (lastValueFrom(bag.setAmount(bag.amount - 100).save()));
    } catch (e) {
      expect(() => { throw e }).toThrow();
    }
  });
});
