import { StringStream, EditorConfiguration } from 'codemirror';
import { TW5ModeState } from '../../state';
import { ParseRule } from '../rules';
import { getMode } from '../../utils';
import TextRule, { TextRuleOption } from '../inner/text';

const CodeBlockBorderRule = /^```/gm;

interface CodeBlockRuleContext {
  line: number;
  stage: number;
  type?: string;
}

function init(): CodeBlockRuleContext {
  return {
    stage: 0,
    line: 0,
  };
}

function parse(stream: StringStream, modeState: TW5ModeState, context: CodeBlockRuleContext): void {
  switch (context.stage) {
    case 0: {
      // ```
      context.stage++;
      context.line = modeState.line;
      modeState.push<TextRuleOption>(TextRule, { to: stream.pos + 3 }, 'CodeBlockBorderLeft');
      return;
    }
    case 1: {
      // CodeBlock type
      if (context.line === modeState.line) {
        const type = stream.string.substr(stream.pos).trimEnd();
        if (type.length > 0) context.type = type;
        modeState.push<TextRuleOption>(TextRule, { to: stream.pos + type.length }, 'CodeBlockType');
      }
      context.stage++;
      return;
    }
    case 2: {
      // Tail after ```xxx
      if (context.line === modeState.line) {
        modeState.push(TextRule, {}, 'WrongText');
      }
      context.stage++;
      return;
    }
    case 3: {
      context.stage++;
      if (context.type !== undefined) {
        const mode = getMode(context.type, modeState.cmCfg as unknown as EditorConfiguration);
        if (mode !== undefined) {
          modeState.innerMode = {
            isLaTeX: false,
            mode,
            state: mode.startState?.() ?? ({} as unknown),
          };
        }
      }
      return;
    }
    case 4: {
      // CodeBlock body
      if (stream.pos !== 0) {
        if (modeState.innerMode === undefined) stream.skipToEnd();
        return;
      }
      CodeBlockBorderRule.lastIndex = stream.pos;
      if (CodeBlockBorderRule.test(stream.string)) {
        context.stage++;
        modeState.innerMode = undefined;
        context.line = modeState.line;
        modeState.push<TextRuleOption>(TextRule, { to: stream.pos + 3 }, 'CodeBlockBorderRight');
      } else {
        if (modeState.innerMode === undefined) stream.skipToEnd();
      }
      return;
    }
    case 5: {
      // Tail after ```
      if (context.line === modeState.line) {
        modeState.push(TextRule, {}, 'WrongText');
      }
      context.stage++;
      return;
    }
    default: {
      modeState.pop();
    }
  }
}

const CodeBlockRule: ParseRule<Record<string, unknown>, CodeBlockRuleContext> = {
  init,
  name: 'CodeBlock',
  test: /```[\w-]*\s*$/gm,
  parse,
};

export default CodeBlockRule;
