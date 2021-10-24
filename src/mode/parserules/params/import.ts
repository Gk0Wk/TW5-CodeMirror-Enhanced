import { StringStream } from 'codemirror';
import { TW5ModeState } from '../../tw5';
import { ParseRule } from '../rules';
import FilterRule from '../inner/filter';
import WrongTailRule from '../inner/wrongtail';

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
      // \import
      context.stage++;
      stream.pos += 7;
      context.line = modeState.line;
      return;
    }
    case 1: {
      // spaces after \import
      context.stage++;
      modeState.skipWhitespace(true);
      return;
    }
    case 2: {
      // filter expression [...]
      if (context.line !== modeState.line) {
        modeState.pop();
      } else {
        context.stage++;
        modeState.push(FilterRule);
      }
      return;
    }
    default: {
      // Eat other string this line
      if (context.line === modeState.line) {
        modeState.push(WrongTailRule);
      } else {
        modeState.pop();
      }
    }
  }
}

const ImportRule: ParseRule<ImportRuleContext> = {
  init,
  name: '',
  test: /^\\import[^\S\n]/gm,
  parse,
};

export default ImportRule;
