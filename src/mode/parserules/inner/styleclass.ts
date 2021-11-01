import { StringStream } from 'codemirror';
import { TW5ModeState } from '../../state';
import { ParseRule } from '../rules';

function init(): Record<string, unknown> {
  return {};
}

function parse(stream: StringStream, modeState: TW5ModeState): void {
  let pointer = stream.pos;
  const length = stream.string.length;
  for (; pointer < length && !/[\s.]/.test(stream.string.charAt(pointer)); pointer++);
  stream.pos = pointer;
  modeState.pop();
}

const StyleClassRule: ParseRule = {
  init,
  name: 'StyleClass',
  test: /\.[\dA-Za-z-]+/gm,
  parse,
};

export default StyleClassRule;
