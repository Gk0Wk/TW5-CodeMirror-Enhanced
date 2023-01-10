import { StringStream } from 'codemirror';
import { TW5ModeState } from '../../state';
import { ParseRule } from '../rules';
import TextRule, { TextRuleOption } from '../inner/text';

interface FilteredTranscludeRuleContext {
  match?: RegExpExecArray;
  nextTo: number;
  stage: number;
}

function init(): FilteredTranscludeRuleContext {
  return {
    stage: 0,
    nextTo: -1,
  };
}

function parse(stream: StringStream, modeState: TW5ModeState, context: FilteredTranscludeRuleContext): void {
  if (context.match === undefined) {
    (FilteredTranscludeRule.test as RegExp).lastIndex = stream.pos;
    context.match = (FilteredTranscludeRule.test as RegExp).exec(stream.string) as RegExpExecArray;
  }
  switch (context.stage) {
    case 0: {
      // {{{
      context.stage++;
      const length = context.match[1].length;
      modeState.push<TextRuleOption>(
        TextRule,
        { to: stream.pos + length },
        length === 3 ? 'FilteredTranscludeBorderLeft' : 'WrongFilteredTranscludeBorderLeft',
      );
      return;
    }
    case 1: {
      // filters
      if (context.match[2] !== undefined) modeState.push<TextRuleOption>(TextRule, { to: stream.pos + context.match[2].length }, 'Filters');
      context.stage++;
      return;
    }
    case 2: {
      // tooltip
      if (context.match[3] !== undefined) modeState.push<TextRuleOption>(TextRule, { to: stream.pos + context.match[3].length }, 'Tooltip');
      context.stage++;
      return;
    }
    case 3: {
      // template
      if (context.match[4] !== undefined) modeState.push<TextRuleOption>(TextRule, { to: stream.pos + context.match[4].length }, 'Template');
      context.stage++;
      return;
    }
    case 4: {
      // }}
      const length = context.match[5].length;
      modeState.push<TextRuleOption>(
        TextRule,
        { to: stream.pos + length },
        length === 2 ? 'FilteredTranscludeBorderRight1' : 'WrongFilteredTranscludeBorderRight1',
      );
      context.stage++;
      return;
    }
    case 5: {
      // style
      if (context.match[6] !== undefined) modeState.push<TextRuleOption>(TextRule, { to: stream.pos + context.match[6].length }, 'Style');
      context.stage++;
      return;
    }
    case 6: {
      // }
      modeState.push<TextRuleOption>(TextRule, { to: stream.pos + 1 }, 'FilteredTranscludeBorderRight2');
      context.stage++;
      return;
    }
    case 7: {
      // css class
      if (context.match[7] !== undefined) modeState.push<TextRuleOption>(TextRule, { to: stream.pos + context.match[7].length }, 'StyleClass');
      context.stage++;
      return;
    }
    default: {
      modeState.pop();
    }
  }
}

const FilteredTranscludeRule: ParseRule<Record<string, unknown>, FilteredTranscludeRuleContext> = {
  init,
  name: 'FilteredTransclude',
  // eslint-disable-next-line security/detect-unsafe-regex
  test: /({{{)(?:([^|]+?)(\|[^{|}]+)?(\|\|[^{|}]+)?)?(}})([^}]*)}(\.\S+)?/gm,
  parse,
};

export default FilteredTranscludeRule;
