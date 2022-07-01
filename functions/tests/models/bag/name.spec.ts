import { lastValueFrom } from 'rxjs';
import { Bag } from '../../../src/models/bag';
import { FirestoreMock } from '../../__mocks/firestore.mock.spec';
import { FAKE_BAG_DB } from '../../__mocks/mockDb';

describe('Bag', () => {
  const firestoreMock = new FirestoreMock();

  beforeEach(() => firestoreMock.reset());

  describe('name', () => {
    const { parent_changes_test, basic_update_bag } = FAKE_BAG_DB.bags;

    it('should do a simple name change', async () => {
      const bag = new Bag(parent_changes_test);
      const newName = 'name changed!';

      expect(bag.name).toBe(parent_changes_test.name);

      const nameUpdate = bag.changeName(newName).commitChanges();
      await lastValueFrom(nameUpdate);

      expect(firestoreMock.get(bag.uid).name).toBe(newName);
    });

    it('should update parent reference as well', async () => {
      const bag = new Bag(basic_update_bag);
      const newName = 'parent should update it as well!';

      expect(bag.name).toBe(basic_update_bag.name);
      expect(parent_changes_test.children![bag.uid].name).toBe(basic_update_bag.name);

      const nameUpdate = bag.changeName(newName).commitChanges();

      await lastValueFrom(nameUpdate);

      expect(firestoreMock.get(bag.uid).name).toBe(newName);
      expect(firestoreMock.get('parent_changes_test').children![bag.uid].name).toBe(newName);
    });
  });
});
