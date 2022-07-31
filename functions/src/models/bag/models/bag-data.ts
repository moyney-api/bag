import { Currency } from '~/models/currency';
import { BagRules } from '../rules/models';

export interface BagData {
  uid: string;
  userUid: string;
  name: string;
  currency: Currency;
  amount: number;
  rules /*Rules*/: BagRules;
  received: { [fromBagId: string]: number };
  children?: { [id: string]: Pick<BagData, 'name' | 'amount'> };
  belongsTo?: string;
}
