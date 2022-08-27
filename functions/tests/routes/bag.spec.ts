import * as express from 'express';
import { MoyFirestoreMock } from 'moy-firebase-manager';
import * as supertest from 'supertest';
import { admin } from '../../src/firebase';
import { Bag } from '../../src/routes/bag';
import FAKE_DB from '../__mocks/dbs/routes/bag.db';

const app = express();

Bag('/bag', app);
const bagApp = supertest(app);

const firestoreMock = new MoyFirestoreMock(FAKE_DB, admin.firestore());
const BAG_USER_TOKEN = 'bag_user_token';

describe('GET', () => {
    it('get by id', async () => {
      const bagUid = FAKE_DB.most_basic_bag.uid!;

      await bagApp.get('/bag')
          .set('Authentication', `Bearer ${BAG_USER_TOKEN}`)
          .send({ uid: bagUid })
          .expect((res) => {
              expect(res.status).toBe(200);
              expect(res.body).toMatchObject(firestoreMock.get(bagUid));
          });
    });
});
