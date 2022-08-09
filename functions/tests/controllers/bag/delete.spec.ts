import { lastValueFrom } from 'rxjs';
import { BagController } from '../../../src/controllers';
import { MoyFirestoreMock } from 'moy-firebase-manager';
import { admin } from '../../../src/firebase';

const FAKE_DB = {
  delete_me: { uid: 'delete_me', userUid: 'delete_user' },
}

const firestoreMock = new MoyFirestoreMock({ bags: FAKE_DB }, admin.firestore());

beforeEach(() => firestoreMock.reset());

describe('Delete', () => {
  it('should delete from db', async () => {
    const { delete_me } = FAKE_DB;

    expect(firestoreMock.get(delete_me.uid!)).toMatchObject(FAKE_DB.delete_me);

    const bagController = new BagController(delete_me.userUid);
    const bagData = await lastValueFrom(bagController.delete(delete_me.uid!));

    expect(firestoreMock.get(delete_me.uid!)).toBeUndefined();
    expect(bagData).toMatchObject(FAKE_DB.delete_me);
  });

  it('should return undefined if deleting a nonexistent uid', async () => {
    const bagController = new BagController('any_user');
    const bagData = await lastValueFrom(bagController.delete('no-existo'));
    expect(bagData).toBeUndefined();
  });
});
