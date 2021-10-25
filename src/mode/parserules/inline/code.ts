import { StringStream } from 'codemirror';
import { TW5ModeState } from '../../state';
import { ParseRule } from '../rules';

interface CodeRuleContext {
  findClosure: boolean;
}

function init(): CodeRuleContext {
  return {
    findClosure: false,
  };
}

function parse(stream: StringStream, modeState: TW5ModeState, context: CodeRuleContext): void {
  if (!context.findClosure) {
    context.findClosure = true;
    stream.pos++;
  }
  if (stream.skipTo('`')) {
    stream.pos += 1;
    modeState.pop();
  } else {
    stream.skipToEnd();
  }
}

const CodeRule: ParseRule<Record<string, unknown>, CodeRuleContext> = {
  init,
  name: 'Code',
  test: '`',
  parse,
};

export default CodeRule;
