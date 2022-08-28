import { MoyFirestoreManager } from 'moy-firebase-manager';
import { map, Observable } from 'rxjs';
import { admin } from '~/firebase';
import { Bag, BAG_ROUTE } from '../bag';
import { BagData } from '../models';

export const deleteFromId = (id: string): Observable<BagData> => {
  const mfsm = new MoyFirestoreManager(admin, BAG_ROUTE);
  mfsm.readToQueue('uid', [id]);

  mfsm.expressionToQueue(() => {
    const bag = new Bag(mfsm.read(id) || {}, mfsm);
    bag.destroy();
  });

  return mfsm.commit().pipe(map(() => mfsm.read(id)));
};
