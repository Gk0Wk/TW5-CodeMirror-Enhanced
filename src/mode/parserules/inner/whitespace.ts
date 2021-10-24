import { StringStream } from 'codemirror';
import { TW5ModeState } from '../../tw5';
import { ParseRule } from '../rules';

export interface WhitespaceRuleOption {
  inlineMode?: boolean;
}

interface WhitespaceRuleContext {
  inlineMode: boolean;
}

function init(options: WhitespaceRuleOption): WhitespaceRuleContext {
  return {
    inlineMode: options.inlineMode === true,
  };
}

function parse(stream: StringStream, modeState: TW5ModeState, context: WhitespaceRuleContext): void {
  stream.eatWhile(/\s+/);
  if (context.inlineMode || !stream.eol()) modeState.pop();
}

const WhitespaceRule: ParseRule<WhitespaceRuleContext, WhitespaceRuleOption> = {
  init,
  name: '',
  test: '',
  parse,
};

export default WhitespaceRule;
