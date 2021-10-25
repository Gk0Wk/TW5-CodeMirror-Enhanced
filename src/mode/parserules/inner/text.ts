import { StringStream } from 'codemirror';
import { TW5ModeState } from '../../state';
import { ParseRule } from '../rules';

export interface TextRuleOption {
  to: number;
}

interface TextRuleContext {
  to?: number;
}

function init(options: TextRuleOption): TextRuleContext {
  return {
    to: options.to,
  };
}

function parse(stream: StringStream, modeState: TW5ModeState, context: TextRuleContext): void {
  if (context.to !== undefined && context.to < stream.string.length) {
    stream.pos = context.to;
  } else {
    stream.skipToEnd();
  }
  modeState.pop();
}

const TextRule: ParseRule<TextRuleOption, TextRuleContext> = {
  init,
  name: 'Text',
  test: '',
  parse,
};

export default TextRule;
