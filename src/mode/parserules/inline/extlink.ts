import { StringStream } from 'codemirror';
import { TW5ModeState } from '../../state';
import { ParseRule } from '../rules';
import TextRule, { TextRuleOption } from '../inner/text';

function init(): Record<string, unknown> {
  return {};
}

function parse(stream: StringStream, modeState: TW5ModeState): void {
  (ExtlinkRule.test as RegExp).lastIndex = stream.pos;
  const match = (ExtlinkRule.test as RegExp).exec(stream.string) as RegExpExecArray;
  if (match[0].charAt(0) === '~') {
    modeState.pop();
    modeState.push<TextRuleOption>(TextRule, { to: (ExtlinkRule.test as RegExp).lastIndex });
  } else {
    stream.pos += match[0].length;
    modeState.pop();
  }
}

const ExtlinkRule: ParseRule = {
  init,
  name: 'Extlink',
  test: /~?(?:file|https?|mailto|ftp|irc|news|data|skype):[^\s"<>[\\\]^`{|}]+(?:\/|\b)/gm,
  parse,
};

export default ExtlinkRule;
