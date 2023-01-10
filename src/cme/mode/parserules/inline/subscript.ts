import { StringStream } from 'codemirror';
import { TW5ModeState } from '../../state';
import { ParseRule } from '../rules';

interface SubscriptRuleContext {
  findClosure: boolean;
}

function init(): SubscriptRuleContext {
  return {
    findClosure: false,
  };
}

function parse(stream: StringStream, modeState: TW5ModeState, context: SubscriptRuleContext): void {
  if (!context.findClosure) {
    context.findClosure = true;
    stream.pos += 2;
  }
  if (stream.skipTo(',,')) {
    stream.pos += 2;
    modeState.pop();
  } else {
    stream.skipToEnd();
  }
}

const SubscriptRule: ParseRule<Record<string, unknown>, SubscriptRuleContext> = {
  init,
  name: 'Subscript',
  test: ',,',
  parse,
};

export default SubscriptRule;
