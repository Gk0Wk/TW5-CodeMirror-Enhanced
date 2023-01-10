import { StringStream } from 'codemirror';
import { TW5ModeState } from '../../state';
import { ParseRule } from '../rules';

interface ItalicRuleContext {
  findClosure: boolean;
}

function init(): ItalicRuleContext {
  return {
    findClosure: false,
  };
}

function parse(stream: StringStream, modeState: TW5ModeState, context: ItalicRuleContext): void {
  if (!context.findClosure) {
    context.findClosure = true;
    stream.pos += 2;
  }
  if (stream.skipTo('//')) {
    stream.pos += 2;
    modeState.pop();
  } else {
    stream.skipToEnd();
  }
}

const ItalicRule: ParseRule<Record<string, unknown>, ItalicRuleContext> = {
  init,
  name: 'Italic',
  test: '//',
  parse,
};

export default ItalicRule;
