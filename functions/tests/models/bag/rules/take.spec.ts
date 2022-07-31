import { lastValueFrom } from 'rxjs';
import { Bag } from '../../../../src/models/bag';
import { FirestoreMock } from '../../../__mocks/firestore.mock.spec';
import { FAKE_BAG_DB } from '../../../__mocks/mockDb';

const firestoreMock = new FirestoreMock();
beforeEach(() => firestoreMock.reset());

describe('Taking', () => {
  const { bag_takes_from_above_bag, bag_sends_all_to_most_basic, bag_takes_fifty_percent } = FAKE_BAG_DB.bags;

  it('should take from another bag on outcome', async () => {
    const bag = new Bag(bag_takes_from_above_bag);

    expect(firestoreMock.get(bag.uid).amount).toBe(bag_takes_from_above_bag.amount);

    await lastValueFrom(bag.setAmount(bag.amount - 5).commitChanges());

    expect(firestoreMock.get(bag.uid).amount).toBe(bag_takes_from_above_bag.amount);
    expect(firestoreMock.get(bag_sends_all_to_most_basic.uid).amount).toBe(bag_sends_all_to_most_basic.amount - 5);
  });

  it('should take what limit states and remove leftover from bag', async () => {
    const bag = new Bag(bag_takes_fifty_percent);

    expect(firestoreMock.get(bag.uid).amount).toBe(bag_takes_fifty_percent.amount);

    await lastValueFrom(bag.setAmount(bag.amount - 5).commitChanges());

    expect(firestoreMock.get(bag.uid).amount).toBe(bag_takes_from_above_bag.amount - 2.5);
    expect(firestoreMock.get(bag_sends_all_to_most_basic.uid).amount).toBe(bag_sends_all_to_most_basic.amount - 2.5);
  });
});
