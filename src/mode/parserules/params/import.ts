import { StringStream } from 'codemirror';
import { TW5ModeState } from '../../state';
import { ParseRule } from '../rules';
import TextRule, { TextRuleOption } from '../inner/text';
import BlankRule, { BlankRuleOption } from '../inner/blank';

interface ImportRuleContext {
  line: number;
  stage: number;
}

function init(): ImportRuleContext {
  return {
    stage: 0,
    line: 0,
  };
}

function parse(stream: StringStream, modeState: TW5ModeState, context: ImportRuleContext): void {
  switch (context.stage) {
    case 0: {
      // whitespaces
      context.stage++;
      modeState.push<BlankRuleOption>(BlankRule, { inlineMode: true }, 'WrongText');
      return;
    }
    case 1: {
      // \import
      context.stage++;
      context.line = modeState.line;
      modeState.push<TextRuleOption>(TextRule, { to: stream.pos + 7 }, 'ImportHeader');
      return;
    }
    case 2: {
      // spaces after \import
      context.stage++;
      modeState.skipWhitespace(true);
      return;
    }
    case 3: {
      // filter expressions [...] [...] ...
      if (context.line !== modeState.line) {
        modeState.pop();
      } else {
        context.stage++;
        modeState.push<TextRuleOption>(TextRule, { to: stream.pos + stream.string.substring(stream.pos).trimEnd().length }, 'Filters');
      }
      return;
    }
    default: {
      // Eat last empty string of this line
      if (context.line === modeState.line) {
        modeState.push(TextRule, {}, 'WrongText');
      } else {
        modeState.pop();
      }
    }
  }
}

const ImportRule: ParseRule<Record<string, unknown>, ImportRuleContext> = {
  init,
  name: 'Import',
  test: /^\s*\\import[^\S\n]/gm,
  parse,
};

export default ImportRule;
