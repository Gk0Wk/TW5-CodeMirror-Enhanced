import { StringStream, EditorConfiguration } from 'codemirror';
import { TW5ModeState } from '../../state';
import { ParseRule } from '../rules';
import { getMode } from '../../utils';
import WrongTextRule from '../inner/wrongtext';

const LaTeXBorderRule: ParseRule = {
  init: () => {
    return {};
  },
  name: 'LaTeXBorder',
  test: '$$',
  parse: (stream: StringStream, modeState: TW5ModeState): void => {
    stream.pos += 2;
    modeState.pop();
  },
};

interface LaTeXRuleContext {
  line: number;
  stage: number;
}

function init(): LaTeXRuleContext {
  return {
    stage: 0,
    line: 0,
  };
}

function parse(stream: StringStream, modeState: TW5ModeState, context: LaTeXRuleContext): void {
  switch (context.stage) {
    case 0: {
      // $$
      context.stage++;
      context.line = modeState.line;
      modeState.push(LaTeXBorderRule);
      return;
    }
    case 1: {
      // Tail after ```xxx
      if (context.line === modeState.line && stream.string.substr(stream.pos).trim() === '') {
        modeState.push(WrongTextRule);
      }
      context.stage++;
      return;
    }
    case 2: {
      context.stage++;
      const mode = getMode('text/x-tex', modeState.cmCfg as unknown as EditorConfiguration);
      if (mode !== undefined) {
        modeState.innerMode = {
          isLaTeX: true,
          mode,
          state: mode.startState?.() ?? ({} as unknown),
        };
      }
      return;
    }
    case 3: {
      // LaTeX body
      if (stream.string.indexOf(LaTeXBorderRule.test as string, stream.pos) === stream.pos) {
        context.stage++;
        modeState.innerMode = undefined;
        modeState.push(LaTeXBorderRule);
      } else {
        if (modeState.innerMode === undefined) stream.skipToEnd();
      }
      return;
    }
    default: {
      modeState.pop();
    }
  }
}

const LaTeXRule: ParseRule<Record<string, unknown>, LaTeXRuleContext> = {
  init,
  name: 'LaTeX',
  test: '$$',
  parse,
};

export default LaTeXRule;
