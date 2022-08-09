import { lastValueFrom } from 'rxjs';
import { BagController } from '../../../src/controllers';
import { MoyFirestoreMock } from 'moy-firebase-manager';
import { admin } from '../../../src/firebase';
import FAKE_DB from '../../__mocks/dbs/controllers/get.db';

const firestoreMock = new MoyFirestoreMock({ bags: FAKE_DB }, admin.firestore());

beforeEach(() => firestoreMock.reset());

describe('Get', () => {
  it('should receive all parameters from a get', async () => {
    const { some_bag } = FAKE_DB;

    const bagController = new BagController(some_bag.userUid)
    const bagData = await lastValueFrom(bagController.get(some_bag.uid!));

    expect(firestoreMock.get(some_bag.uid!).name).toEqual(bagData.name);
    expect(firestoreMock.get(some_bag.uid!).amount).toEqual(bagData.amount);
    expect(firestoreMock.get(some_bag.uid!).currency).toEqual(bagData.currency);
    expect(firestoreMock.get(some_bag.uid!).userUid).toEqual(bagData.userUid);
    expect(firestoreMock.get(some_bag.uid!).belongsTo).toEqual(bagData.belongsTo);
  });

  it('should return undefined if getting a nonexistent uid', async () => {
    const bagController = new BagController('any_user');
      const bagData = await lastValueFrom(bagController.get('no-existo'));
      expect(bagData).toBeUndefined();
  });
});
