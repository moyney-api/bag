import { AfterCommitHistory } from 'moy-firebase-manager';
import { Observable } from 'rxjs';
import { Bag, BagData } from '../models';

export class BagController {
  constructor(private userUid: string) {}

  get(uid: string): Observable<BagData | BagData[]> {
    if (!uid) {
      return Bag.allBags(this.userUid);
    }

    return Bag.fromId(uid);
  }

  patch(bagData: Partial<BagData>): Observable<AfterCommitHistory> {
    const bag = new Bag({ ...bagData, userUid: this.userUid });
    const { name, currency, amount, rules, belongsTo } = bagData;

    if (name) bag.changeName(name);
    if (currency) bag.changeCurrency(currency);
    if (amount) bag.setAmount(amount);
    if (rules) bag.setRules(rules);
    if (belongsTo) bag.setBelongsTo(belongsTo);
    return bag.save();
  }

  delete(uid: string): Observable<BagData> {
    return Bag.deleteFromId(uid);
  }
}
