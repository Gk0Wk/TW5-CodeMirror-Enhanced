import { StringStream, EditorConfiguration } from 'codemirror';
import { TW5ModeState } from '../../state';
import { ParseRule } from '../rules';
import { getMode } from '../../utils';
import TextRule, { TextRuleOption } from '../inner/text';

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
      modeState.push<TextRuleOption>(TextRule, { to: stream.pos + 2 }, 'LaTeXBorderLeft');
      return;
    }
    case 1: {
      // Tail after ```xxx
      if (context.line === modeState.line && stream.string.substr(stream.pos).trim() === '') {
        modeState.push(TextRule, {}, 'WrongText');
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
      if (stream.string.indexOf('$$', stream.pos) === stream.pos) {
        context.stage++;
        modeState.innerMode = undefined;
        modeState.push<TextRuleOption>(TextRule, { to: stream.pos + 2 }, 'LaTeXBorderLeft');
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
  test: /\$\$$|\$\$[^$]/gm,
  parse,
};

export default LaTeXRule;
