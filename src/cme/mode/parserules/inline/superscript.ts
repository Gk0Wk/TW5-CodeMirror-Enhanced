import { StringStream } from 'codemirror';
import { TW5ModeState } from '../../state';
import { ParseRule } from '../rules';

interface SuperscriptRuleContext {
  findClosure: boolean;
}

function init(): SuperscriptRuleContext {
  return {
    findClosure: false,
  };
}

function parse(stream: StringStream, modeState: TW5ModeState, context: SuperscriptRuleContext): void {
  if (!context.findClosure) {
    context.findClosure = true;
    stream.pos += 2;
  }
  if (stream.skipTo('^^')) {
    stream.pos += 2;
    modeState.pop();
  } else {
    stream.skipToEnd();
  }
}

const SuperscriptRule: ParseRule<Record<string, unknown>, SuperscriptRuleContext> = {
  init,
  name: 'Superscript',
  test: '^^',
  parse,
};

export default SuperscriptRule;
