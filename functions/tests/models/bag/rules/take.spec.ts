import { lastValueFrom } from 'rxjs';
import { Bag } from '../../../../src/models/bag';
import { MoyFirestoreMock } from 'moy-firebase-manager';
import FAKE_DB from '../../../__mocks/dbs/models/take.db';
import { admin } from '../../../../src/firebase';

const firestoreMock = new MoyFirestoreMock({ bags: FAKE_DB }, admin.firestore());
beforeEach(() => firestoreMock.reset());

describe('Taking', () => {
  const { basic_bag, bag_takes_from_above_bag, bag_takes_fifty_percent } = FAKE_DB;

  it('should take from another bag on outcome', async () => {
    const bag = new Bag(bag_takes_from_above_bag);

    expect(firestoreMock.get(bag.uid).amount).toBe(bag_takes_from_above_bag.amount);

    await lastValueFrom(bag.setAmount(bag.amount - 5).save());

    expect(firestoreMock.get(bag.uid).amount).toBe(bag_takes_from_above_bag.amount);
    expect(firestoreMock.get(basic_bag.uid!).amount).toBe(basic_bag.amount! - 5);
  });

  it('should take what limit states and remove leftover from bag', async () => {
    const bag = new Bag(bag_takes_fifty_percent);

    expect(firestoreMock.get(bag.uid).amount).toBe(bag_takes_fifty_percent.amount);

    await lastValueFrom(bag.setAmount(bag.amount - 5).save());

    expect(firestoreMock.get(bag.uid).amount).toBe(bag_takes_from_above_bag.amount! - 2.5);
    expect(firestoreMock.get(basic_bag.uid!).amount).toBe(basic_bag.amount! - 2.5);
  });
});
