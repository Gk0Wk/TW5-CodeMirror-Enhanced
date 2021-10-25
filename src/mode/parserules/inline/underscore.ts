import { StringStream } from 'codemirror';
import { TW5ModeState } from '../../state';
import { ParseRule } from '../rules';

interface UnderscoreRuleContext {
  findClosure: boolean;
}

function init(): UnderscoreRuleContext {
  return {
    findClosure: false,
  };
}

function parse(stream: StringStream, modeState: TW5ModeState, context: UnderscoreRuleContext): void {
  if (!context.findClosure) {
    context.findClosure = true;
    stream.pos += 2;
  }
  if (stream.skipTo('__')) {
    stream.pos += 2;
    modeState.pop();
  } else {
    stream.skipToEnd();
  }
}

const UnderscoreRule: ParseRule<Record<string, unknown>, UnderscoreRuleContext> = {
  init,
  name: 'Underscore',
  test: '__',
  parse,
};

export default UnderscoreRule;
