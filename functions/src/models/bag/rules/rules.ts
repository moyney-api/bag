import { concatMap, of, OperatorFunction } from 'rxjs';
import { MoyFirestoreManager } from 'moy-firebase-manager';
import { Bag } from '../bag';
import { BagRule, RuleActions } from './models';

abstract class RuleAction {
  protected limit = Infinity;
  protected limitUnit?: string;

  constructor(limitCode: string, protected target: string, protected parentBag: Bag, protected mfsm: MoyFirestoreManager) {
    if (limitCode) {
      const [limitQuantity, limitUnit] = limitCode.split('l:')[1].split(/(\D)/);
      this.limit = +limitQuantity || Infinity;
      this.limitUnit = limitUnit;
    }
  }

  abstract getRuleStep(): OperatorFunction<number, number>;

  addToBatchAmountToPass(amountToPass: number, from?: string): void {
    if (amountToPass !== 0) {
      this.mfsm.expressionToQueue(() => {
        const targetBag = new Bag(this.mfsm.read(this.target), this.mfsm);
        targetBag.setAmount(targetBag.amount + amountToPass, from);
      });
    }
  }
}

class Send extends RuleAction {
  getRuleStep(): OperatorFunction<number, number> {
    return concatMap((leftover: number) => {
      let amountToPass = 0;

      if (this.limitUnit === '%') {
        amountToPass = leftover * (this.limit / 100);
      } else {
        amountToPass = leftover > this.limit ? this.limit : leftover;
      }

      this.addToBatchAmountToPass(amountToPass);
      return of(leftover - amountToPass);
    });
  }
}

class SendUpTo extends RuleAction {
  getRuleStep(): OperatorFunction<number, number> {
    if (this.limit === Infinity) {
      throw new Error('Rule su2 cannot lack `limit` parameter');
    }

    return concatMap((leftover: number) => {
      const targetHasReceived = this.mfsm.read(this.target).received[this.parentBag.uid] || 0;
      const constrainedLimit = this.limit - targetHasReceived;
      const amountToPass = constrainedLimit > leftover ? leftover : constrainedLimit;

      this.addToBatchAmountToPass(amountToPass, this.parentBag.uid);
      return of(leftover - amountToPass);
    });
  }
}

class Take extends RuleAction {
  getRuleStep(): OperatorFunction<number, number> {
    return concatMap((leftover = 0) => {
      let amountToTake = 0;

      if (this.limitUnit === '%') {
        amountToTake = leftover * (this.limit / 100);
      } else {
        amountToTake = leftover > this.limit ? this.limit : leftover;
      }


      this.addToBatchAmountToPass(-1 * amountToTake);
      return of(leftover - amountToTake);
    });
  }
}

class TakeUpTo extends RuleAction {
  getRuleStep(): OperatorFunction<number, number> {
    if (this.limit === Infinity) {
      throw new Error('Rule tu2 cannot have an empty limit rule');
    }

    return concatMap((leftover = 0) => {
      const targetHasReceived = this.mfsm.read(this.target).received[this.parentBag.uid] || 0;
      const constrainedLimit = this.limit + targetHasReceived;
      const amountToPass = constrainedLimit > leftover ? leftover : constrainedLimit;

      if (amountToPass > 0) {
        this.addToBatchAmountToPass(-1 * amountToPass, this.parentBag.uid);
      }

      return of(leftover - amountToPass);
    });
  }
}

export class RuleParser {
  constructor(private rules: BagRule[], private mfsm: MoyFirestoreManager, private parentBag: Bag) {}

  addBagInitToQueue(): RuleParser {
    const bagUids = this.rules.map(r => (r.match(/(?<=t:)(.+(?=\|)|(.+))/g) || '')[0]);

    this.mfsm.readToQueue('uid', bagUids);

    return this;
  }

  parseRules(): OperatorFunction<number, number>[] {
    return this.rules.map(rule => this.singleRule(rule).getRuleStep());
  }

  private singleRule(rule: BagRule): RuleAction {
    const [actionCode, targetCode, limitCode] = rule.split('|');
    const targetUid = targetCode.split('t:')[1];

    const Rule = this.ruleActionFromCode(actionCode);
    return new Rule(limitCode, targetUid, this.parentBag, this.mfsm);
  }

  private ruleActionFromCode(actionCode: string): new (...args: [string, string, Bag, MoyFirestoreManager]) => RuleAction {
    switch (actionCode.split('a:')[1]) {
      case RuleActions.Send:
        return Send;
      case RuleActions.SendUpTo:
        return SendUpTo;
      case RuleActions.Take:
        return Take;
      case RuleActions.TakeUpTo:
        return TakeUpTo;
      default:
        return Send;
    }
  }
}
