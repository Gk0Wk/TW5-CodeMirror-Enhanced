import { StringStream } from 'codemirror';
import { TW5ModeState } from '../../state';
import { ParseRule } from '../rules';
import FilterRule from '../inner/filter';
import WrongTailRule from '../inner/wrongtail';

interface WhitespaceRuleContext {
  line: number;
  stage: number;
}

function init(): WhitespaceRuleContext {
  return {
    stage: 0,
    line: 0,
  };
}

function parse(stream: StringStream, modeState: TW5ModeState, context: WhitespaceRuleContext): void {
  switch (context.stage) {
    case 0: {
      // \import
      context.stage++;
      stream.pos += 7;
      context.line = modeState.line;
      return;
    }
    case 1: {
      // spaces after \import
      context.stage++;
      modeState.skipWhitespace(true);
      return;
    }
    case 2: {
      // filter expression [...]
      if (context.line !== modeState.line) {
        modeState.pop();
      } else {
        context.stage++;
        modeState.push(FilterRule);
      }
      return;
    }
    default: {
      // Eat other string this line
      if (context.line === modeState.line) {
        modeState.push(WrongTailRule);
      } else {
        modeState.pop();
      }
    }
  }
}

const WhitespaceRule: ParseRule<Record<string, unknown>, WhitespaceRuleContext> = {
  init,
  name: 'Whitespace',
  test: /^\\whitespace[^\S\n]/gm,
  parse,
};

export default WhitespaceRule;
