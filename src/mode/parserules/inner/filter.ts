import { TW5ModeState } from '../../state';
import { StringStream } from 'codemirror';
import { ParseRule } from '../rules';
import { TextRuleOption, TextRuleContext } from './text';

export type FilterRuleOption = TextRuleOption;
type FilterRuleContext = TextRuleContext;

function init(option: FilterRuleOption): FilterRuleContext {
  return {
    to: option.to,
  };
}

function parse(stream: StringStream, modeState: TW5ModeState, context: FilterRuleContext): void {
  let index = stream.pos;
  const length = context.to === undefined ? stream.string.length : Math.min(stream.string.length, context.to);
  for (let level = 0; index < length; index++) {
    switch (stream.string.charAt(index)) {
      case '[':
        level++;
        break;
      case ']':
        level--;
        break;
    }
    if (level === 0) break;
  }
  stream.pos = index + 1;
  modeState.pop();
}

const FilterRule: ParseRule<FilterRuleOption, FilterRuleContext> = {
  init,
  name: 'Filter',
  test: '[',
  parse,
};

export default FilterRule;
