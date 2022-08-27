import { defer, map, Observable, of, tap } from 'rxjs';
import { AfterCommitHistory, MoyFirestoreManager } from 'moy-firebase-manager';
import { Currency, priceOfFirstCurrInSecondCurr } from '../currency';
import { BagData } from './models';
import { RuleParser } from './rules/rules';
import { admin } from '../../firebase';
import { allBags, fromId, deleteFromId } from './static';

export const BAG_ROUTE = 'bags';

export const DEFAULT_BAG_DATA: Required<Pick<BagData, 'children' | 'amount' | 'currency' | 'name' | 'received' | 'rules'>> = {
  children: {},
  amount: 0,
  currency: Currency.Euro,
  name: 'New bag',
  received: {},
  rules: {},
};

export class Bag implements BagData {
  static fromId = fromId;
  static allBags = allBags;
  static deleteFromId = deleteFromId;

  uid: string;
  userUid: string;
  name: string;
  currency: Currency;
  amount: number;
  rules: Required<BagData>['rules'];
  received: Required<BagData>['received'];
  children: Required<BagData>['children'];

  totalAmount: number;
  conversionRates: { [currency: string]: number } = {};

  belongsTo?: string;

  constructor(bag: BagData, private mfsm: MoyFirestoreManager = new MoyFirestoreManager(admin, BAG_ROUTE)) {
    this.userUid = bag.userUid;

    this.uid = bag.uid || this.mfsm.newDoc();
    this.name = bag.name || DEFAULT_BAG_DATA.name;
    this.amount = bag.amount || DEFAULT_BAG_DATA.amount;
    this.currency = bag.currency || DEFAULT_BAG_DATA.currency;
    this.rules = bag.rules || DEFAULT_BAG_DATA.rules;
    this.received = bag.received || DEFAULT_BAG_DATA.received;
    this.children = bag.children || DEFAULT_BAG_DATA.children;
    this.belongsTo = bag.belongsTo;
    this.totalAmount = this.calcTotalAmount();

    if (!bag.uid) {
      this.mfsm.batchToQueue(this.uid, {
        name: this.name,
        userUid: this.userUid,
        amount: this.amount,
        currency: this.currency,
        rules: this.rules,
        received: this.received,
        children: this.children,
      });
    }
  }

  save = (): Observable<AfterCommitHistory> => {
    return this.mfsm.commit();
  }

  destroy = (): void => {
    const deleteExpression = () => {
      if (this.belongsTo) {
        this.mfsm.batchToQueue(this.belongsTo, { [`children.${this.uid}`]: undefined });
      }
      if (this.children) {
        Object.keys(this.children).forEach(childId => {
          this.mfsm.batchToQueue(childId, { belongsTo: undefined });
        });
      }

      this.mfsm.deleteToQueue(this.uid);
    }

    this.mfsm.expressionToQueue(deleteExpression);
  }

  changeName = (newName: string): Bag => {
    if (this.belongsTo) {
      this.mfsm.batchToQueue(this.belongsTo, { [`children.${this.uid}.name`]: newName });
    }

    this.mfsm.batchToQueue(this.uid, { name: newName }, () => this.name = newName);
    return this;
  }

  changeCurrency = (newCurrency: Currency, force = false): Bag => {
    if (this.belongsTo && !force) {
      throw new Error('Cannot update currency. This bag belongs to another. You could change the topmost bag\'s currency');
    }

    this.mfsm.expressionToQueue(this.currencyConversionRate(newCurrency));

    if (this.children) {
      this.changeChildrenCurrencies(newCurrency);
    }

    this.mfsm.batchToQueue(this.uid, { currency: newCurrency }, () => {
      this.currency = newCurrency;
      this.mfsm.expressionToQueue(() => this.setAmount(this.amount * this.conversionRates[newCurrency]));
    });

    return this;
  }

  setAmount = (newAmount?: number, from?: string): Bag => {
    const difference = (newAmount || 0) - this.amount;
    this.triggerRulesOnDifference(difference);

    if (this.belongsTo) {
      this.mfsm.batchToQueue(this.belongsTo, { [`children.${this.uid}`]: { name: this.name, amount: this.amount + difference + this.childrenSumAmount() } });
    }

    const awaitDiff = () => {
      const bagChanges: { [prop: string]: number } = { amount: this.amount + difference };

      if (from) {
        bagChanges[`received.${from}`] = (this.received[from] || 0) + difference;
      }

      return this.mfsm.batchToQueue(this.uid, bagChanges, () => {
        if (from) {
          this.received[from] = (this.received[from] || 0) + difference;
        }
        this.amount = this.amount + difference;
        this.totalAmount = this.calcTotalAmount();
      });
    };

    this.mfsm.expressionToQueue(awaitDiff);

    return this;
  }

  amountInCurrency = (currency: Currency): Observable<{ amount: number; to: Currency; from: Currency }> => {
    return this.currencyConversionRate(currency).pipe(
      map((price) => ({ amount: price * this.amount, to: currency, from: this.currency })),
    );
  }

  setBelongsTo = (bagId: string | undefined): Bag => {
    if (bagId) {
      this.assignToParentBag(bagId);
    }

    if (this.belongsTo) {
      this.mfsm.batchToQueue(this.belongsTo, { [`children.${this.uid}`]: undefined });
    }

    this.mfsm.batchToQueue(this.uid, { belongsTo: bagId }, () => { this.belongsTo = bagId });

    return this;
  }

  setRules = (newRules: BagData['rules']): Bag => {
    this.mfsm.batchToQueue(this.uid, { rules: newRules }, () => { this.rules = newRules || {} });

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

  private assignToParentBag = (bagId: string): void => {
    this.mfsm.readToQueue('uid', [bagId]);

    const updateBagCurrency = () => {
      if (!this.mfsm.read(bagId)) {
        throw new Error('Target bag does not exist');
      }

      const parentBag = new Bag(this.mfsm.read(bagId));

      if (parentBag.currency !== this.currency) {
        this.changeCurrency(parentBag.currency, true);
      } else {
        this.mfsm.batchToQueue(bagId, { [`children.${this.uid}`]: { amount: this.amount, name: this.name } });
      }
    };

    this.mfsm.expressionToQueue(updateBagCurrency);
  }

  private changeChildrenCurrencies = (newCurrency: Currency): void => {
    const childrenUids = Object.keys(this.children!);
    this.mfsm.readToQueue('uid', childrenUids);

    childrenUids.forEach(childUid => {
      const childUpdate = () => {
        const childBag = new Bag(this.mfsm.read(childUid), this.mfsm);
        childBag.conversionRates = this.conversionRates;
        childBag.changeCurrency(newCurrency, true);
      };
      const childSideEffect = () => {
        this.children![childUid].amount! *= this.conversionRates[newCurrency];
      };

      this.mfsm.expressionToQueue(childUpdate, childSideEffect);
    });
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
    return Object.values(this.children).reduce((total, childBag) => total += childBag.amount!, 0);
  }
}
