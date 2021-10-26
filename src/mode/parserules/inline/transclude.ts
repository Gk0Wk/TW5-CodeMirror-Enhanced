import { StringStream } from 'codemirror';
import { TW5ModeState } from '../../state';
import { ParseRule } from '../rules';

const TranscludeBorderLeftRule: ParseRule = {
  init: () => {
    return {};
  },
  name: 'TranscludeBorderLeft',
  test: '{{',
  parse: (stream: StringStream, modeState: TW5ModeState): void => {
    stream.pos += 2;
    modeState.pop();
  },
};

const TranscludeBorderRightRule: ParseRule = {
  init: () => {
    return {};
  },
  name: 'TranscludeBorderRight',
  test: '}}',
  parse: (stream: StringStream, modeState: TW5ModeState): void => {
    stream.pos += 2;
    modeState.pop();
  },
};

interface TranscludeRuleContext {
  line: number;
  stage: number;
}

function init(): TranscludeRuleContext {
  return {
    stage: 0,
    line: 0,
  };
}

function parse(stream: StringStream, modeState: TW5ModeState, context: TranscludeRuleContext): void {
  switch (context.stage) {
    case 0: {
      // {{
      context.stage++;
      context.line = modeState.line;
      modeState.push(TranscludeBorderLeftRule);
      return;
    }
    case 1: {
      // something after {{ and before }}
      if (stream.skipTo('}')) context.stage++;
      return;
    }
    case 2: {
      // }}
      context.stage++;
      modeState.push(TranscludeBorderRightRule);
      return;
    }
    default: {
      modeState.pop();
    }
  }
}

const TranscludeRule: ParseRule<Record<string, unknown>, TranscludeRuleContext> = {
  init,
  name: 'Transclude',
  // eslint-disable-next-line security/detect-unsafe-regex
  test: /{{[^}]*}}/gm,
  parse,
};

export default TranscludeRule;
