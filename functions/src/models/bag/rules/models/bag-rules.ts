import { RuleActions } from './rule-actions';
import { RuleTriggers } from './rule-triggers';

export type BagRule = `a:${RuleActions}|t:${string}${`|l:${number}${'%' | ''}` | ''}`;
export type BagRules = { [trigger in RuleTriggers]?: BagRule[] };
