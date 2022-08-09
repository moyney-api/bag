import { lastValueFrom } from 'rxjs';
import { Bag } from '../../../../src/models/bag';
import { MoyFirestoreMock } from 'moy-firebase-manager';
import { admin } from '../../../../src/firebase';
import FAKE_DB from '../../../__mocks/dbs/models/send.db';

const firestoreMock = new MoyFirestoreMock({ bags: FAKE_DB }, admin.firestore());
beforeEach(() => firestoreMock.reset());

describe('Sending', () => {
  const { bag_sends_5_to_most_basic, bag_sends_all_to_most_basic, basic_bag } = FAKE_DB;

  it('should send to another bag on income', async () => {
    const bag = new Bag(bag_sends_5_to_most_basic);

    expect(firestoreMock.get(bag.uid).amount).toBe(bag_sends_5_to_most_basic.amount);

    await lastValueFrom(bag.setAmount(bag.amount + 10).save());

    expect(firestoreMock.get(bag.uid).amount).toBe(bag_sends_5_to_most_basic.amount! + 5);
    expect(firestoreMock.get(basic_bag.uid!).amount).toBe(5);
  });

  it('should send maximum amount possible', async () => {
    const bag = new Bag(bag_sends_all_to_most_basic);
    
    expect(firestoreMock.get(bag.uid).amount).toBe(bag_sends_all_to_most_basic.amount)

    await (lastValueFrom(bag.setAmount(bag.amount + 100).save()));

    expect(firestoreMock.get(bag.uid).amount).toBe(bag_sends_all_to_most_basic.amount);
    expect(firestoreMock.get(basic_bag.uid!).amount).toBe(100);
  });
});
