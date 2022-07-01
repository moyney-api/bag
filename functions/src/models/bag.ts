import { combineLatest, concatMap, defer, expand, from, map, Observable, of, skipWhile, take, tap } from 'rxjs';
import { admin } from '../firebase';
import { Currency, priceOfFirstCurrInSecondCurr } from './currency';

function *obsIteratorFromDynamicArray({ dynamicArray }: { dynamicArray: Observable<any>[] }) {
  let index = 0;
  let dynamicArrayHasValues = true;
  let nextObs = dynamicArray[index++];

  while(dynamicArrayHasValues) {
    if (nextObs) yield nextObs;
    else dynamicArrayHasValues = false;
    nextObs = dynamicArray[index++];
  }
}

export class MoyFirestoreManager {
  private fs = admin.firestore();
  private batch = this.fs.batch();
  private batchCount = 0;
  private beforeCommitQueue: Observable<any>[] = [];

  constructor(private collection: string) {}

  ref(id: string): admin.firestore.DocumentReference {
    return this.fs.doc(`${this.collection}/${id}`);
  }

  commitChanges(): Observable<admin.firestore.WriteResult[]> {
    const obsIterator = obsIteratorFromDynamicArray({ dynamicArray: this.beforeCommitQueue });

    return of(true).pipe(
      expand(() => obsIterator.next().value || of('__END__')),
      skipWhile(v => v !== '__END__'),
      take(1),
      concatMap(() => from(this.batch.commit())),
      tap(() => this.batch = this.fs.batch()),
    );
  }

  expressionToQueue = (expression: Observable<any> | (() => any), sideEffect?: () => void): void => {
    if (expression instanceof Observable<any>) {
      this.beforeCommitQueue.push(sideEffect ? expression.pipe(tap({ next: sideEffect })) : expression);
    } else {
      const exprToObs = defer(() => of(expression()));
      this.beforeCommitQueue.push(sideEffect ? exprToObs.pipe(tap({ next: sideEffect })) : exprToObs);
    }
  }

  batchToQueue = (ref: admin.firestore.DocumentReference, body: { [key: string]: any }, sideEffect?: () => void): void => {
    this.batchCount += 1;
    if (this.batchCount >= 15) {
      console.warn('Warning: Only ', 20 - this.batchCount, ' more batch operations allowed');
    }

    const baseExpression = () => this.batch.set(ref, body, { merge: true });
    this.expressionToQueue(baseExpression, sideEffect);
  }
}

export interface BagData {
  uid: string;
  userUid: string;
  name: string;
  currency: Currency;
  amount: number;
  rules: [];
  children?: { [id: string]: Pick<BagData, 'name' | 'amount'> };
  belongsTo?: string;
}

export class Bag implements BagData {
  uid: string;
  userUid: string;
  name: string;
  currency: Currency;
  amount: number;
  rules: [];
  totalAmount: number;
  children?: BagData['children'];
  belongsTo?: string;
  conversionRates: { [currency: string]: number } = {};

  private mfsm = new MoyFirestoreManager('bags');

  constructor(bag: BagData) {
    this.uid = bag.uid;
    this.userUid = bag.userUid;
    this.name = bag.name;
    this.currency = bag.currency;
    this.amount = bag.amount;
    this.rules = bag.rules;
    this.children = bag.children;
    this.belongsTo = bag.belongsTo;
    this.totalAmount = this.calcTotalAmount();
  }

  shareDbManager(dbManager: MoyFirestoreManager): void {
    this.mfsm = dbManager;
  }

  commitChanges(): Observable<Bag> {
    return this.mfsm.commitChanges().pipe(map(() => this));
  }

  changeName(newName: string): Bag {
    if (this.belongsTo) {
      this.mfsm.batchToQueue(this.mfsm.ref(this.belongsTo), { [`children.${this.uid}.name`]: newName });
    }

    this.mfsm.batchToQueue(
      this.mfsm.ref(this.uid),
      { name: newName },
      () => this.name = newName,
    );

    return this;
  }

  changeCurrency(newCurrency: Currency, force = false): Bag {
    if (this.belongsTo && !force) {
      throw new Error('Cannot update currency. This bag belongs to another. You could change the topmost bag\'s currency');
    }

    this.mfsm.expressionToQueue(this.currencyConversionRate(newCurrency));

    if (this.children) {
      this.changeChildrenCurrencies(newCurrency);
    }

    this.mfsm.batchToQueue(
      this.mfsm.ref(this.uid),
      { currency: newCurrency },
      () => this.setAmount(this.amount * this.conversionRates[newCurrency]),
    );

    return this;
  }

  setAmount(newAmount: number): Bag {
    if (this.belongsTo) {
      this.mfsm.batchToQueue(
        this.mfsm.ref(this.belongsTo),
        { [`children.${this.uid}`]: { name: this.name, amount: newAmount + this.childrenSumAmount() } }
      );
    }

    this.mfsm.batchToQueue(
      this.mfsm.ref(this.uid),
      { amount: newAmount },
      () => {
        this.amount = newAmount;
        this.totalAmount = this.calcTotalAmount();
      },
    );

    return this;
  }

  amountInCurrency(currency: Currency): Observable<{ amount: number; to: Currency; from: Currency }> {
    return this.currencyConversionRate(currency).pipe(
      map((price) => ({ amount: price * this.amount, to: currency, from: this.currency })),
    );
  }

  assignToBag(bagId: string | undefined): Bag {
    if (bagId) {
      this.assignToParentBag(bagId);
    }

    if (this.belongsTo) {
      this.mfsm.batchToQueue(
        this.mfsm.ref(this.belongsTo),
        { [`children.${this.uid}`]: undefined },
      );
    }

    this.mfsm.batchToQueue(
      this.mfsm.ref(this.uid),
      { belongsTo: bagId },
      () => { this.belongsTo = bagId }
    );

    return this;
  }

  private assignToParentBag(bagId: string): void {
    const newBagRef = this.mfsm.ref(bagId);
    const newBagCurrency = from(newBagRef.get()).pipe(
      map(snapshot => snapshot.data()!),
      tap(({currency}) => {
        if (currency !== this.currency) {
          this.changeCurrency(currency, true);
        } else {
          this.mfsm.batchToQueue(newBagRef, { [`children.${this.uid}`]: { amount: this.amount, name: this.name } });
        }
      }),
    );

    this.mfsm.expressionToQueue(newBagCurrency);
  }

  private changeChildrenCurrencies(newCurrency: Currency): void {
    const childrenValues = Object.keys(this.children!).map(childId =>
      from(this.mfsm.ref(childId).get())
    );

    const updateChildren = combineLatest(childrenValues).pipe(
      tap(snaps => snaps.forEach(snapshot => {
          const childBody = snapshot.data() as BagData;
          const childBag = new Bag({ ...childBody, uid: snapshot.id });
          childBag.conversionRates = this.conversionRates;
          childBag.shareDbManager(this.mfsm);
          childBag.changeCurrency(newCurrency, true);
        }),
      ),
    );

    const childrenUpdateSideEffect = () => {
      Object.keys(this.children!).forEach(c => {
        this.children![c].amount *= this.conversionRates[newCurrency];
      });
    };

    this.mfsm.expressionToQueue(updateChildren, childrenUpdateSideEffect);
  }

  private currencyConversionRate(currency: Currency): Observable<number> {
    const cachedData = this.conversionRates[currency];
    const freshData = priceOfFirstCurrInSecondCurr(this.currency, currency).pipe(
      map(({ price }) => price),
      tap(price => this.conversionRates[currency] = price),
    );

    if (cachedData) {
      return of(cachedData);
    }
    return freshData;
  }

  private calcTotalAmount(): number {
    return this.amount + this.childrenSumAmount();
  }

  private childrenSumAmount(): number {
    return Object.values(this.children || {}).reduce((total, childBag) => total += childBag.amount, 0);
  }
}
