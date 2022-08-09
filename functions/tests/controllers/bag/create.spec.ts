import { lastValueFrom } from 'rxjs';
import { BagController } from '../../../src/controllers';
import { MoyFirestoreMock } from 'moy-firebase-manager';
import { admin } from '../../../src/firebase';
import { BagData, Currency, DEFAULT_BAG_DATA } from '../../../src/models';
import FAKE_DB, { bagWithBelongsToParams } from '../../__mocks/dbs/controllers/create.db';

const firestoreMock = new MoyFirestoreMock({ bags: FAKE_DB }, admin.firestore());

beforeEach(() => firestoreMock.reset());

describe('Create', () => {
  it('should create a new bag with default parameters', async () => {
    const userUid = 'MockUserUid';

    const bagController = new BagController(userUid);
    const { create } = await lastValueFrom(bagController.patch({ userUid }));
    const createdBagId = Object.keys(create)[0];

    expect(firestoreMock.get(createdBagId)).toMatchObject({ ...DEFAULT_BAG_DATA, userUid, uid: createdBagId });
  });

  it('should create a new bag with custom parameters', async () => {
    const bagParams: BagData = {
      userUid: 'MockUserUid',
      amount: 30,
      currency: Currency.Bitcoin,
      name: 'What a weird name!',
      received: {
        receiving_bag: 100,
      },
      rules: {
        oi: ['a:s|t:receiving_bag'],
      },
    };

    const bagController = new BagController(bagParams.userUid);
    const { create } = await lastValueFrom(bagController.patch(bagParams));
    const createdBagId = Object.keys(create)[0];

    expect(firestoreMock.get(createdBagId)).toMatchObject({ ...bagParams, uid: createdBagId });
  });

  it('should update external bag if created with belongs to', async () => {
    const { made_up_bag } = FAKE_DB;
    const bagController = new BagController(made_up_bag.userUid);
    expect(firestoreMock.get(made_up_bag.uid!).belongsTo).toBeUndefined();

    const { create } = await lastValueFrom(bagController.patch(bagWithBelongsToParams));
    const createdBagId = Object.keys(create)[0];

    expect(firestoreMock.get(createdBagId).belongsTo).toEqual(made_up_bag.uid);
    expect(firestoreMock.get(made_up_bag.uid!).children)
      .toMatchObject({
        [createdBagId]: {
          name: bagWithBelongsToParams.name,
          amount: bagWithBelongsToParams.amount,
        },
      });
  });
});
