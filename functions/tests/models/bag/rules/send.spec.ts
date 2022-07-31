import { lastValueFrom } from 'rxjs';
import { Bag } from '../../../../src/models/bag';
import { FirestoreMock } from '../../../__mocks/firestore.mock.spec';
import { FAKE_BAG_DB } from '../../../__mocks/mockDb';

const firestoreMock = new FirestoreMock();
beforeEach(() => firestoreMock.reset());

describe('Sending', () => {
  const { bag_sends_1_to_most_basic, bag_sends_all_to_most_basic, most_basic_bag } = FAKE_BAG_DB.bags;

  it('should send to another bag on income', async () => {
    const bag = new Bag(bag_sends_1_to_most_basic);

    expect(firestoreMock.get(bag.uid).amount).toBe(bag_sends_1_to_most_basic.amount);

    await lastValueFrom(bag.setAmount(bag.amount + 5).commitChanges());

    expect(firestoreMock.get(bag.uid).amount).toBe(bag_sends_1_to_most_basic.amount + 4);
    expect(firestoreMock.get(most_basic_bag.uid).amount).toBe(most_basic_bag.amount + 1);
  });

  it('should send maximum amount possible', async () => {
    const bag = new Bag(bag_sends_all_to_most_basic);
    
    expect(firestoreMock.get(bag.uid).amount).toBe(bag_sends_all_to_most_basic.amount)

    await (lastValueFrom(bag.setAmount(bag.amount + 100).commitChanges()));

    expect(firestoreMock.get(bag.uid).amount).toBe(bag_sends_all_to_most_basic.amount);
    expect(firestoreMock.get(most_basic_bag.uid).amount).toBe(most_basic_bag.amount + 100);
  });
});
