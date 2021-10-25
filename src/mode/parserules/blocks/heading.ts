import { StringStream } from 'codemirror';
import { TW5ModeState } from '../../state';
import { ParseRule } from '../rules';
import TextRule from '../inner/text';

interface HeadingRuleContext {
  level: number;
  line: number;
  stage: number;
}

function init(): HeadingRuleContext {
  return {
    level: 0,
    stage: 0,
    line: 0,
  };
}

function parse(stream: StringStream, modeState: TW5ModeState, context: HeadingRuleContext): void {
  switch (context.stage) {
    case 0: {
      // !+
      context.stage++;
      (HeadingRule.test as RegExp).lastIndex = stream.pos;
      const match = (HeadingRule.test as RegExp).exec(stream.string) as RegExpExecArray;
      context.level = match[1].length;
      stream.pos += context.level;
      context.line = modeState.line;
      return;
    }
    case 1: {
      // spaces after !+
      context.stage++;
      modeState.skipWhitespace(true);
      return;
    }
    case 2: {
      // Heading title
      if (context.line !== modeState.line) {
        modeState.pop();
      } else {
        context.stage++;
        modeState.push(TextRule);
      }
      return;
    }
    default: {
      modeState.pop();
    }
  }
}

const HeadingRule: ParseRule<Record<string, unknown>, HeadingRuleContext> = {
  init,
  name: 'Heading',
  test: /(!{1,6})/gm,
  parse,
};

export default HeadingRule;
