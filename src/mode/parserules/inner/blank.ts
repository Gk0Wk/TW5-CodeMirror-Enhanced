import { StringStream } from 'codemirror';
import { TW5ModeState } from '../../state';
import { ParseRule } from '../rules';

export interface BlankRuleOption {
  inlineMode?: boolean;
}

interface BlankRuleContext {
  inlineMode: boolean;
}

function init(options: BlankRuleOption): BlankRuleContext {
  return {
    inlineMode: options.inlineMode === true,
  };
}

function parse(stream: StringStream, modeState: TW5ModeState, context: BlankRuleContext): void {
  stream.eatWhile(/\s+/);
  if (context.inlineMode || !stream.eol()) modeState.pop();
}

const BlankRule: ParseRule<BlankRuleOption, BlankRuleContext> = {
  init,
  name: '',
  test: '',
  parse,
};

export default BlankRule;
