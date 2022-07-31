import { lastValueFrom } from 'rxjs';
import { Bag } from '../../../src/models/bag';
import { FirestoreMock } from '../../__mocks/firestore.mock.spec';
import { FAKE_BAG_DB } from '../../__mocks/mockDb';

const firestoreMock = new FirestoreMock();

beforeEach(() => firestoreMock.reset());

describe('Assign to bag', () => {
  describe('if bag was already assigned', () => {
    const { double_nested_bag_1, double_nested_bag_2, single_nested_bag } = FAKE_BAG_DB.bags;

    it('should unassing from one bag, and assign to another', async () => {
      const bag = new Bag(single_nested_bag);

      expect(firestoreMock.get(bag.uid).belongsTo).toBe(bag.belongsTo);
      expect(firestoreMock.get(double_nested_bag_2.uid).children![bag.uid]).toEqual({ name: bag.name, amount: bag.totalAmount });
      expect(firestoreMock.get(double_nested_bag_1.uid).children?.[bag.uid]).toBeUndefined();

      await lastValueFrom(bag.assignToBag(double_nested_bag_1.uid).commitChanges());

      expect(firestoreMock.get(bag.uid).belongsTo).toBe(double_nested_bag_1.uid);
      expect(firestoreMock.get(double_nested_bag_2.uid).children![bag.uid]).toBeUndefined();
      expect(firestoreMock.get(double_nested_bag_1.uid).children![bag.uid]).toEqual({ name: bag.name, amount: bag.totalAmount });
    });
  });

  describe('if bag was unassigned', () => {
    const { most_basic_bag, parent_changes_test } = FAKE_BAG_DB.bags;

    it('should assign to the new bag', async () => {
      const bag = new Bag(most_basic_bag);
      expect(firestoreMock.get(bag.uid).belongsTo).toBeUndefined();

      await lastValueFrom(bag.assignToBag(parent_changes_test.uid).commitChanges());

      expect(firestoreMock.get(bag.uid).belongsTo).toBe(parent_changes_test.uid);
      expect(firestoreMock.get(parent_changes_test.uid).children![bag.uid]).toEqual({ name: bag.name, amount: bag.totalAmount });
    });
  });

  it('should error if bag belongs does not exist', async () => {
    const { single_nested_bag } = FAKE_BAG_DB.bags;
    const bag = new Bag(single_nested_bag);
    expect(firestoreMock.get(bag.uid).belongsTo).toBe(bag.belongsTo);

    try {
      await lastValueFrom(bag.assignToBag('i-dont-exist').commitChanges());
    } catch (e) {
      expect(() => { throw e }).toThrowError('User does not exist');
    }
  });

  it('should be able to unassing from any bag', async () => {
    const { single_nested_bag } = FAKE_BAG_DB.bags;
    const bag = new Bag(single_nested_bag);
    expect(firestoreMock.get(bag.uid).belongsTo).toBe(bag.belongsTo);

    await lastValueFrom(bag.assignToBag(undefined).commitChanges());

    expect(firestoreMock.get(bag.uid).belongsTo).toBeUndefined();
  });

  it('should update currency if assigning to bag with another currency', async () => {
    const { /*EUR w/ child*/double_nested_bag_2, single_nested_bag, /*BTC*/most_basic_bag } = FAKE_BAG_DB.bags;
    const bag = new Bag(double_nested_bag_2);

    expect(firestoreMock.get(double_nested_bag_2.uid).currency).toBe('EUR');
    expect(firestoreMock.get(most_basic_bag.uid).currency).toBe('BTC');
    expect(firestoreMock.get(single_nested_bag.uid).currency).toBe('EUR');

    await lastValueFrom(bag.assignToBag(most_basic_bag.uid).commitChanges());

    expect(firestoreMock.get(double_nested_bag_2.uid).currency).toBe('BTC');
    expect(firestoreMock.get(most_basic_bag.uid).currency).toBe('BTC');
    expect(firestoreMock.get(single_nested_bag.uid).currency).toBe('BTC');
  });
});
