import { StringStream, EditorConfiguration } from 'codemirror';
import { TW5ModeState } from '../../state';
import { ParseRule } from '../rules';
import { getMode } from '../../utils';
import WrongTextRule from '../inner/wrongtext';

const CodeBlockBorderRule: ParseRule = {
  init: () => {
    return {};
  },
  name: 'CodeBlockBorder',
  test: /^```/gm,
  parse: (stream: StringStream, modeState: TW5ModeState): void => {
    stream.pos += 3;
    modeState.pop();
  },
};

const CodeBlockTypeRule: ParseRule = {
  init: () => {
    return {};
  },
  name: 'CodeBlockType',
  test: '',
  parse: (stream: StringStream, modeState: TW5ModeState): void => {
    const type = stream.string.substr(stream.pos).trimEnd();
    if (type.length > 0 && modeState.contextStack.length > 1) {
      (modeState.contextStack[modeState.contextStack.length - 2].context as unknown as CodeBlockRuleContext).type = type;
    }
    stream.pos += type.length;
    modeState.pop();
  },
};

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
      modeState.push(CodeBlockBorderRule);
      return;
    }
    case 1: {
      // CodeBlock type
      if (context.line === modeState.line) {
        modeState.push(CodeBlockTypeRule);
      }
      context.stage++;
      return;
    }
    case 2: {
      // Tail after ```xxx
      if (context.line === modeState.line) {
        modeState.push(WrongTextRule);
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
      (CodeBlockBorderRule.test as RegExp).lastIndex = stream.pos;
      if ((CodeBlockBorderRule.test as RegExp).test(stream.string)) {
        context.stage++;
        modeState.innerMode = undefined;
        context.line = modeState.line;
        modeState.push(CodeBlockBorderRule);
      } else {
        if (modeState.innerMode === undefined) stream.skipToEnd();
      }
      return;
    }
    case 5: {
      // Tail after ```
      if (context.line === modeState.line) {
        modeState.push(WrongTextRule);
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
