import { StringStream } from 'codemirror';
import { TW5ModeState } from '../../state';
import { ParseRule } from '../rules';

function init(): Record<string, unknown> {
  return {};
}

function parse(stream: StringStream, modeState: TW5ModeState): void {
  if (stream.skipTo('-->')) {
    stream.pos += 3;
    modeState.pop();
  } else {
    stream.skipToEnd();
  }
}

const CommentRule: ParseRule = {
  init,
  name: 'Comment',
  test: '<!--',
  parse,
};

export default CommentRule;
