import { combineLatest, defer, from, map, Observable, of, tap } from 'rxjs';
import { MoyFirestoreManager } from '../../firebase';
import { Currency, priceOfFirstCurrInSecondCurr } from '../currency';
import { BagData } from './models';
import { BagRules } from './rules';
import { RuleParser } from './rules/rules';

export class Bag implements BagData {
  uid: string;
  userUid: string;
  name: string;
  currency: Currency;
  amount: number;
  rules: BagRules /*Rules*/ = {};
  totalAmount: number;
  children?: BagData['children'];
  belongsTo?: string;
  conversionRates: { [currency: string]: number } = {};

  get received(): BagData['received'] {
    return this._received;
  };

  private _received: BagData['received'] = {};

  constructor(bag: BagData, private mfsm: MoyFirestoreManager = new MoyFirestoreManager('bags')) {
    this.uid = bag.uid;
    this.userUid = bag.userUid;
    this.name = bag.name;
    this.currency = bag.currency;
    this.amount = bag.amount;
    this.rules = bag.rules || {};
    this._received = bag.received || {};
    this.children = bag.children;
    this.belongsTo = bag.belongsTo;
    this.totalAmount = this.calcTotalAmount();
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

  setAmount(newAmount: number, from?: string): Bag {
    const difference = newAmount - this.amount;
    this.triggerRulesOnDifference(difference);

    if (this.belongsTo) {
      this.mfsm.batchToQueue(
        this.mfsm.ref(this.belongsTo),
        { [`children.${this.uid}`]: { name: this.name, amount: this.amount + difference + this.childrenSumAmount() } }
      );
    }

    const awaitDiff = defer(() => {
      const bagChanges: { [prop: string]: number } = { amount: this.amount + difference };

      if (from) {
        bagChanges[`received.${from}`] = (this.received[from] || 0) + difference;
      }

      return of(this.mfsm.batchToQueue(
          this.mfsm.ref(this.uid),
          bagChanges,
          () => {
            this.amount = this.amount + difference;
            this.totalAmount = this.calcTotalAmount();
          },
        ));
    });

    this.mfsm.expressionToQueue(awaitDiff);

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

  setRules(newRules: BagData['rules']): Bag {
    this.mfsm.batchToQueue(
      this.mfsm.ref(this.uid),
      { rules: newRules },
      () => { this.rules = newRules }
    );

    return this;
  }

  private triggerRulesOnDifference(difference: number): void {
    const { oi, oo, oov } = this.rules;

    if (difference > 0 && oi) {
      const ruleParser = new RuleParser(oi, this.mfsm, this);
      ruleParser.addBagInitToQueue();
      const ruleExpression = defer(() => of(difference).pipe(
        ...(ruleParser.parseRules() as []),
        tap(left => this.amount -= (difference - left)),
      ));

      this.mfsm.expressionToQueue(ruleExpression);
    }

    if (difference < 0 && oo) {
      const ruleParser = new RuleParser(oo, this.mfsm, this);
      ruleParser.addBagInitToQueue();
      const ruleExpression = defer(() => of(-1 * difference).pipe(
        ...(ruleParser.parseRules() as []),
        tap(left => this.amount -= (difference + left)),
      ))

      this.mfsm.expressionToQueue(ruleExpression);

      if ((this.amount + difference) < 0 && oov) {
        const ruleSteps = new RuleParser(oov, this.mfsm, this).addBagInitToQueue().parseRules() as [];
        this.mfsm.expressionToQueue(of(difference).pipe(...ruleSteps));
      }
    }
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
          const childBag = new Bag({ ...childBody, uid: snapshot.id }, this.mfsm);
          childBag.conversionRates = this.conversionRates;
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
