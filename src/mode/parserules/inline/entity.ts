import { StringStream } from 'codemirror';
import { TW5ModeState } from '../../state';
import { ParseRule } from '../rules';

function init(): Record<string, unknown> {
  return {};
}

function parse(stream: StringStream, modeState: TW5ModeState): void {
  (EntityRule.test as RegExp).lastIndex = stream.pos;
  const match = (EntityRule.test as RegExp).exec(stream.string) as RegExpExecArray;
  stream.pos += match[0].length;
  modeState.pop();
}

const EntityRule: ParseRule = {
  init,
  name: 'Entity',
  test: /&#?[\dA-Za-z]{2,8};/gm,
  parse,
};

export default EntityRule;
