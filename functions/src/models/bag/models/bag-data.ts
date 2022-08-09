import { Currency } from '~/models/currency';
import { BagRules } from '../rules/models';

export interface BagData {
  userUid: string;
  uid?: string;
  name?: string;
  amount?: number;
  currency?: Currency;
  rules?: BagRules;
  belongsTo?: string;
  received?: { [fromBagId: string]: number };
  children?: { [id: string]: Pick<BagData, 'name' | 'amount'> };
}
