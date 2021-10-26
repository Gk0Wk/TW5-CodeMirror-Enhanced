import { ParseRule } from '../rules';
import TextRule, { TextRuleOption, TextRuleContext } from './text';

export type WrongTextRuleOption = TextRuleOption;
type WrongTextRuleContext = TextRuleContext;

const WrongTextRule: ParseRule<WrongTextRuleOption, WrongTextRuleContext> = {
  init: TextRule.init,
  name: 'WrongText',
  test: '',
  parse: TextRule.parse,
};

export default WrongTextRule;
