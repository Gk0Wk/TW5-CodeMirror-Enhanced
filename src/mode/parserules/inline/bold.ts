import { StringStream } from 'codemirror';
import { TW5ModeState } from '../../state';
import { ParseRule } from '../rules';

interface BoldRuleContext {
  findClosure: boolean;
}

function init(): BoldRuleContext {
  return {
    findClosure: false,
  };
}

function parse(stream: StringStream, modeState: TW5ModeState, context: BoldRuleContext): void {
  if (!context.findClosure) {
    context.findClosure = true;
    stream.pos += 2;
  }
  if (stream.skipTo("''")) {
    stream.pos += 2;
    modeState.pop();
  } else {
    stream.skipToEnd();
  }
}

const BoldRule: ParseRule<Record<string, unknown>, BoldRuleContext> = {
  init,
  name: 'Bold',
  test: "''",
  parse,
};

export default BoldRule;
