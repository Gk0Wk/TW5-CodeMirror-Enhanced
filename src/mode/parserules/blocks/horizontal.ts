import { StringStream } from 'codemirror';
import { TW5ModeState } from '../../state';
import { ParseRule } from '../rules';
import WrongTailRule from '../inner/wrongtail';

interface HorizontalRuleContext {
  line: number;
  stage: number;
}

function init(): HorizontalRuleContext {
  return {
    line: 0,
    stage: 0,
  };
}

function parse(stream: StringStream, modeState: TW5ModeState, context: HorizontalRuleContext): void {
  switch (context.stage) {
    case 0: {
      // ---+
      context.stage++;
      context.line = modeState.line;
      stream.eatWhile('-');
      return;
    }
    case 1: {
      // Tail after ---+
      if (context.line === modeState.line) {
        modeState.push(WrongTailRule);
      }
      context.stage++;
      return;
    }
    default: {
      modeState.pop();
    }
  }
}

const HorizontalRule: ParseRule<Record<string, unknown>, HorizontalRuleContext> = {
  init,
  name: 'Horizontal',
  test: /-{3,}\s*$/gm,
  parse,
};

export default HorizontalRule;
