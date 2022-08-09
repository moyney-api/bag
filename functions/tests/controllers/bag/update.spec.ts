import { lastValueFrom } from 'rxjs';
import { BagController } from '../../../src/controllers';
import { MoyFirestoreMock } from 'moy-firebase-manager';
import { admin } from '../../../src/firebase';

const FAKE_DB = { 
  standard_bag: {
    uid: 'standard_bag',
    userUid: 'update_user',
    amount: 30,
  }
}

const firestoreMock = new MoyFirestoreMock({ bags: FAKE_DB }, admin.firestore());

beforeEach(() => firestoreMock.reset());

describe('Update', () => {
  it('should update an existing bag', async () => {
    const { standard_bag } = FAKE_DB;

    const bagController = new BagController(standard_bag.userUid);

    const { update } = await lastValueFrom(bagController.patch({ uid: standard_bag.uid, amount: 50 }));

    expect(firestoreMock.get(standard_bag.uid).amount).toEqual(50);
    expect(update[standard_bag.uid].amount).toEqual(50);
  });
});
