import { TW5ModeState } from '../../state';
import { StringStream } from 'codemirror';
import { ParseRule } from '../rules';

function init(): Record<string, unknown> {
  return {};
}

function parse(stream: StringStream, modeState: TW5ModeState): void {
  let index = stream.pos;
  const length = stream.string.length;
  for (let level = 0; index < length; index++) {
    switch (stream.string.charAt(index)) {
      case '[':
        level++;
        break;
      case ']':
        level--;
        break;
    }
    if (level === 0) break;
  }
  stream.pos = index + 1;
  modeState.pop();
}

const WhitespaceRule: ParseRule = {
  init,
  name: 'Filter',
  test: '[',
  parse,
};

export default WhitespaceRule;
