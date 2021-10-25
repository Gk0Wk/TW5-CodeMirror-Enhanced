import { StringStream } from 'codemirror';
import { TW5ModeState } from '../../state';
import { ParseRule } from '../rules';

interface StrikethroughRuleContext {
  findClosure: boolean;
}

function init(): StrikethroughRuleContext {
  return {
    findClosure: false,
  };
}

function parse(stream: StringStream, modeState: TW5ModeState, context: StrikethroughRuleContext): void {
  if (!context.findClosure) {
    context.findClosure = true;
    stream.pos += 2;
  }
  if (stream.skipTo('~~')) {
    stream.pos += 2;
    modeState.pop();
  } else {
    stream.skipToEnd();
  }
}

const StrikethroughRule: ParseRule<Record<string, unknown>, StrikethroughRuleContext> = {
  init,
  name: 'Strikethrough',
  test: '~~',
  parse,
};

export default StrikethroughRule;
