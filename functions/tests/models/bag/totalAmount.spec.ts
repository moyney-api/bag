import { Bag } from '../../../src/models/bag';
import { FirestoreMock } from '../../__mocks/firestore.mock.spec';
import { FAKE_BAG_DB } from '../../__mocks/mockDb';

describe('Bag', () => {
  const firestoreMock = new FirestoreMock();

  beforeEach(() => firestoreMock.reset());

  describe('total amount', () => {
    const {
      triple_nested_bag,
      double_nested_bag_1,
      double_nested_bag_2,
      single_nested_bag,
    } = FAKE_BAG_DB.bags;

    it('should add up the correct amount if children have said amount', async () => {
      const bag = new Bag(triple_nested_bag);
      // triple_nested_bag contains all others
      const allNestedAmount = double_nested_bag_1.amount + double_nested_bag_2.amount + single_nested_bag.amount;

      expect(bag.totalAmount).toBe(bag.amount + allNestedAmount);
    });
  });
});
