import { StringStream } from 'codemirror';
import { TW5ModeState } from '../../tw5';
import { ParseRule } from '../rules';

function init(): Record<string, unknown> {
  return {};
}

function parse(stream: StringStream, modeState: TW5ModeState): void {
  stream.skipToEnd();
  modeState.pop();
}

const WrongTailRule: ParseRule = {
  init,
  name: 'ErrorTail',
  test: '',
  parse,
};

export default WrongTailRule;
