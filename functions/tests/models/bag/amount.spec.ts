import { lastValueFrom } from 'rxjs';
import { Bag } from '../../../src/models/bag';
import { FirestoreMock } from '../../__mocks/firestore.mock.spec';
import { FAKE_BAG_DB } from '../../__mocks/mockDb';

describe('Bag', () => {
  const firestoreMock = new FirestoreMock();

  beforeEach(() => firestoreMock.reset());

  describe('set amount', () => {
    const { basic_update_bag, parent_changes_test } = FAKE_BAG_DB.bags;

    it('should update amount', async () => {
      const bag = new Bag(basic_update_bag);
      const newAmount = 300;

      expect(bag.amount).toBe(basic_update_bag.amount);

      await lastValueFrom(bag.setAmount(newAmount).commitChanges());

      expect(firestoreMock.get(bag.uid).amount).toBe(newAmount);
    });

    it('should update parent amount', async () => {
      const bag = new Bag(basic_update_bag);
      const newAmount = 500;

      await lastValueFrom(bag.setAmount(newAmount).commitChanges());

      expect(firestoreMock.get(parent_changes_test.uid).children!.basic_update_bag.amount).toBe(newAmount);
    });
  });
});
