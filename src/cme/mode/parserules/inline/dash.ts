import { StringStream } from 'codemirror';
import { TW5ModeState } from '../../state';
import { ParseRule } from '../rules';

function init(): Record<string, unknown> {
  return {};
}

function parse(stream: StringStream, modeState: TW5ModeState): void {
  (DashRule.test as RegExp).lastIndex = stream.pos;
  const match = (DashRule.test as RegExp).exec(stream.string) as RegExpExecArray;
  stream.pos += match[0].length;
  modeState.pop();
}

const DashRule: ParseRule = {
  init,
  name: 'Dash',
  test: /-{2,3}(?!-)/gm,
  parse,
};

export default DashRule;
