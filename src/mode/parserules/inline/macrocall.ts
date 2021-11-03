import { StringStream } from 'codemirror';
import { TW5ModeState } from '../../state';
import { ParseRule } from '../rules';
import TextRule, { TextRuleOption } from '../inner/text';

interface MacroCallRuleContext {
  match?: RegExpExecArray;
  stage: number;
}

function init(): MacroCallRuleContext {
  return {
    stage: 0,
  };
}

function parse(stream: StringStream, modeState: TW5ModeState, context: MacroCallRuleContext): void {
  if (context.match === undefined) {
    (MacroCallRule.test as RegExp).lastIndex = stream.pos;
    context.match = (MacroCallRule.test as RegExp).exec(stream.string) as RegExpExecArray;
  }
  switch (context.stage) {
    case 0: {
      modeState.push<TextRuleOption>(TextRule, { to: stream.pos + 2 }, 'MacroCallBorderLeft');
      context.stage++;
      return;
    }
    case 1: {
      modeState.push<TextRuleOption>(TextRule, { to: stream.pos + context.match[1].length }, 'MacroName');
      context.stage++;
      return;
    }
    case 2: {
      if (context.match[2] !== undefined) {
        modeState.push<TextRuleOption>(TextRule, { to: stream.pos + context.match[2].length }, 'MacroCallAttributes');
      }
      context.stage++;
      return;
    }
    case 3: {
      modeState.push<TextRuleOption>(TextRule, { to: stream.pos + 2 }, 'MacroCallBorderRight');
      context.stage++;
      return;
    }
    default: {
      modeState.pop();
    }
  }
}

const MacroCallRule: ParseRule<Record<string, unknown>, MacroCallRuleContext> = {
  init,
  name: 'MacroCall',
  test: /<<([^\s>]+)([^>]+)?>>/gm,
  parse,
};

export default MacroCallRule;
