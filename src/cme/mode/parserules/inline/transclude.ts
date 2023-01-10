import { StringStream } from 'codemirror';
import { TW5ModeState } from '../../state';
import { ParseRule } from '../rules';
import TextRule, { TextRuleOption } from '../inner/text';

interface TranscludeRuleContext {
  match1?: RegExpExecArray;
  match2?: RegExpExecArray;
  stage: number;
}

function init(): TranscludeRuleContext {
  return {
    stage: 0,
  };
}

const TextReferenceRegEx = /(?:(.*?)(!!.*))|(?:(.*?)(##.*))|(.*)/gm;

function parse(stream: StringStream, modeState: TW5ModeState, context: TranscludeRuleContext): void {
  if (context.match1 === undefined) {
    (TranscludeRule.test as RegExp).lastIndex = stream.pos;
    context.match1 = (TranscludeRule.test as RegExp).exec(stream.string) as RegExpExecArray;
  }
  switch (context.stage) {
    case 0: {
      // {{
      context.stage++;
      const length = context.match1[1].length;
      modeState.push<TextRuleOption>(TextRule, { to: stream.pos + length }, length === 2 ? 'TranscludeBorderLeft' : 'WrongTranscludeBorderLeft');
      return;
    }
    case 1: {
      // Reference(Tiddler, Field, Index)
      if (context.match1[2] === undefined) {
        context.stage = 5;
      } else {
        TextReferenceRegEx.lastIndex = 0;
        context.match2 = TextReferenceRegEx.exec(context.match1[2]) as RegExpExecArray;
        context.stage++;
      }
      return;
    }
    case 2: {
      if ((context.match2 as RegExpExecArray)[1] !== undefined) {
        // Tiddler!!Field
        modeState.push<TextRuleOption>(TextRule, { to: stream.pos + (context.match2 as RegExpExecArray)[1].length }, 'Tiddler');
        context.stage = 3;
      } else if ((context.match2 as RegExpExecArray)[3] !== undefined) {
        // Tiddler##Index
        modeState.push<TextRuleOption>(TextRule, { to: stream.pos + (context.match2 as RegExpExecArray)[3].length }, 'Tiddler');
        context.stage = 4;
      } else {
        // Tiddler
        modeState.push<TextRuleOption>(TextRule, { to: stream.pos + (context.match2 as RegExpExecArray)[5].length }, 'Tiddler');
        context.stage = 5;
      }
      return;
    }
    case 3: {
      // !!Field
      if ((context.match2 as RegExpExecArray)[2] !== undefined) {
        // Tiddler!!Field
        modeState.push<TextRuleOption>(TextRule, { to: stream.pos + (context.match2 as RegExpExecArray)[2].length }, 'Field');
      }
      context.stage = 5;
      return;
    }
    case 4: {
      // ##Index
      if ((context.match2 as RegExpExecArray)[4] !== undefined) {
        // Tiddler!!Field
        modeState.push<TextRuleOption>(TextRule, { to: stream.pos + (context.match2 as RegExpExecArray)[4].length }, 'Index');
      }
      context.stage = 5;
      return;
    }
    case 5: {
      // Template
      if (context.match1[3] !== undefined) modeState.push<TextRuleOption>(TextRule, { to: stream.pos + context.match1[3].length }, 'Template');
      context.stage++;
      return;
    }
    case 6: {
      // }}
      context.stage++;
      const length = context.match1[4].length;
      modeState.push<TextRuleOption>(TextRule, { to: stream.pos + length }, length === 2 ? 'TranscludeBorderRight' : 'WrongTranscludeBorderRight');
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
  test: /({{)([^{|}]+)?(\|\|[^{|}]+)?(}})/gm,
  parse,
};

export default TranscludeRule;
