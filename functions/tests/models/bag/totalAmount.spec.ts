import { Bag } from '../../../src/models/bag';
import { MoyFirestoreMock } from 'moy-firebase-manager';
import FAKE_DB from '../../__mocks/dbs/models/totalAmount.db';
import { admin } from '../../../src/firebase';

const firestoreMock = new MoyFirestoreMock({ bags: FAKE_DB }, admin.firestore());

beforeEach(() => firestoreMock.reset());

describe('total amount', () => {
  const {
    father_bag,
    sibling_bag_1,
    sibling_bag_2,
    child_bag,
  } = FAKE_DB;

  it('should add up the correct amount if children have said amount', async () => {
    const bag = new Bag(father_bag);
    const allNestedAmount = sibling_bag_1.amount! + sibling_bag_2.amount! + child_bag.amount!;

    expect(bag.totalAmount).toBe(bag.amount + allNestedAmount);
  });
});
