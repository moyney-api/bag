import { lastValueFrom } from 'rxjs';
import { Bag } from '../../../src/models/bag';
import { MoyFirestoreMock } from 'moy-firebase-manager';
import { admin } from '../../../src/firebase';
import FAKE_DB from '../../__mocks/dbs/models/assignToBag.db';

const firestoreMock = new MoyFirestoreMock({ bags: FAKE_DB }, admin.firestore());

beforeEach(() => firestoreMock.reset());

describe('Assign to bag', () => {
  describe('if bag was already assigned', () => {
    const { sibling_bag_1, sibling_bag_2, child_bag } = FAKE_DB;

    it('should unassing from one bag, and assign to another', async () => {
      const bag = new Bag(child_bag);

      expect(firestoreMock.get(bag.uid).belongsTo).toBe(bag.belongsTo);
      expect(firestoreMock.get(sibling_bag_2.uid!).children![bag.uid]).toEqual({ name: bag.name, amount: bag.totalAmount });
      expect(firestoreMock.get(sibling_bag_1.uid!).children?.[bag.uid]).toBeUndefined();

      await lastValueFrom(bag.setBelongsTo(sibling_bag_1.uid).save());

      expect(firestoreMock.get(bag.uid).belongsTo).toBe(sibling_bag_1.uid);
      expect(firestoreMock.get(sibling_bag_2.uid!).children![bag.uid]).toBeUndefined();
      expect(firestoreMock.get(sibling_bag_1.uid!).children![bag.uid]).toEqual({ name: bag.name, amount: bag.totalAmount });
    });
  });

  describe('if bag was unassigned', () => {
    const { most_basic_bag, parent_changes_test } = FAKE_DB;

    it('should assign to the new bag', async () => {
      const bag = new Bag(most_basic_bag);
      expect(firestoreMock.get(bag.uid).belongsTo).toBeUndefined();

      await lastValueFrom(bag.setBelongsTo(parent_changes_test.uid).save());

      expect(firestoreMock.get(bag.uid).belongsTo).toBe(parent_changes_test.uid);
      expect(firestoreMock.get(parent_changes_test.uid!).children![bag.uid]).toEqual({ name: bag.name, amount: bag.totalAmount });
    });
  });

  it('should error if bag belongs does not exist', async () => {
    const { child_bag } = FAKE_DB;
    const bag = new Bag(child_bag);
    expect(firestoreMock.get(bag.uid).belongsTo).toBe(bag.belongsTo);

    try {
      await lastValueFrom(bag.setBelongsTo('i-dont-exist').save());
    } catch (e) {
      expect(() => { throw e }).toThrowError('Target bag does not exist');
    }
  });

  it('should be able to unassing from any bag', async () => {
    const { child_bag } = FAKE_DB;
    const bag = new Bag(child_bag);
    expect(firestoreMock.get(bag.uid).belongsTo).toBe(bag.belongsTo);

    await lastValueFrom(bag.setBelongsTo(undefined).save());

    expect(firestoreMock.get(bag.uid).belongsTo).toBeUndefined();
  });

  it('should update currency if assigning to bag with another currency', async () => {
    const { /*EUR w/ child*/sibling_bag_2, child_bag, /*BTC*/most_basic_bag } = FAKE_DB;
    const bag = new Bag(sibling_bag_2);

    expect(firestoreMock.get(sibling_bag_2.uid!).currency).toBe('EUR');
    expect(firestoreMock.get(most_basic_bag.uid!).currency).toBe('BTC');
    expect(firestoreMock.get(child_bag.uid!).currency).toBe('EUR');

    await lastValueFrom(bag.setBelongsTo(most_basic_bag.uid).save());

    expect(firestoreMock.get(sibling_bag_2.uid!).currency).toBe('BTC');
    expect(firestoreMock.get(most_basic_bag.uid!).currency).toBe('BTC');
    expect(firestoreMock.get(child_bag.uid!).currency).toBe('BTC');
  });
});
