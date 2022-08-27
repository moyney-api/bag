import { MoyFirestoreManager } from 'moy-firebase-manager';
import { map, Observable } from 'rxjs';
import { admin } from '~/firebase';
import { BAG_ROUTE } from '../bag';
import { BagData } from '../models';

export const allBags = (userUid: string): Observable<BagData[]> => {
  const mfsm = new MoyFirestoreManager(admin, BAG_ROUTE);
  mfsm.readToQueue('userUid', [userUid]);
  return mfsm.commit().pipe(map(({ read }) => Object.values(read)));
}
