import { lastValueFrom } from 'rxjs';
import { Bag } from '../../../src/models/bag';
import { MoyFirestoreMock } from 'moy-firebase-manager';
import { admin } from '../../../src/firebase';
import FAKE_DB from '../../__mocks/dbs/models/amount.db';

const firestoreMock = new MoyFirestoreMock({ bags: FAKE_DB }, admin.firestore());

beforeEach(() => firestoreMock.reset());

describe('setAmount', () => {
  const { child_bag, parent_bag } = FAKE_DB;

  it('should update amount', async () => {
    const bag = new Bag(child_bag);
    const newAmount = 300;

    expect(bag.amount).toBe(child_bag.amount);

    await lastValueFrom(bag.setAmount(newAmount).save());

    expect(firestoreMock.get(bag.uid).amount).toBe(newAmount);
  });

  it('should update parent amount', async () => {
    const bag = new Bag(child_bag);
    const newAmount = 500;

    await lastValueFrom(bag.setAmount(newAmount).save());

    expect(firestoreMock.get(parent_bag.uid!).children!.child_bag.amount).toBe(newAmount);
  });
});
