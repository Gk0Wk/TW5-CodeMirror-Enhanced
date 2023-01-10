import { StringStream } from 'codemirror';
import { TW5ModeState } from '../../state';
import { ParseRule, InlineRules } from '../rules';
import TextRule, { TextRuleOption } from '../inner/text';
import StyleClassRule from '../inner/styleclass';
import { findNearestRule } from '../../utils';

interface ListRuleContext {
  header: string;
  justParsedAInlineRule: boolean;
  line: number;
  nextInlineRule?: ParseRule;
  stage: number;
}

function init(): ListRuleContext {
  return {
    header: '',
    justParsedAInlineRule: false,
    stage: 0,
    line: 0,
  };
}

function parse(stream: StringStream, modeState: TW5ModeState, context: ListRuleContext): void {
  switch (context.stage) {
    case 0: {
      // *#;:>+
      context.stage++;
      (ListRule.test as RegExp).lastIndex = stream.pos;
      context.header = ((ListRule.test as RegExp).exec(stream.string) as RegExpExecArray)[1];
      modeState.push<TextRuleOption>(TextRule, { to: stream.pos + context.header.length }, 'ListHeader');
      context.line = modeState.line;
      return;
    }
    case 1: {
      // classes after !
      if (context.line !== modeState.line) {
        modeState.pop();
      } else {
        if (stream.peek() === '.') modeState.push(StyleClassRule);
        else context.stage++;
      }
      return;
    }
    case 2: {
      // spaces after class
      if (context.line !== modeState.line) {
        modeState.pop();
      } else {
        context.stage++;
        modeState.skipWhitespace(true);
      }
      return;
    }
    default: {
      // List contents
      if (context.nextInlineRule !== undefined) {
        modeState.push(context.nextInlineRule);
        context.nextInlineRule = undefined;
        context.justParsedAInlineRule = true;
        return;
      }
      if (context.justParsedAInlineRule) {
        context.line = modeState.line;
        context.justParsedAInlineRule = false;
      }
      if (context.line !== modeState.line) {
        modeState.pop();
      } else {
        // Find the next occurrence of a inlinerule
        const ruleAndPos = findNearestRule(InlineRules as ParseRule[], stream);
        // Process any inline rule, along with the text preceding it
        if (ruleAndPos === undefined) {
          modeState.push<TextRuleOption>(TextRule);
        } else if (ruleAndPos[1] === stream.pos) {
          modeState.push(ruleAndPos[0]);
        } else {
          // pos of inline rule > stream.pos
          modeState.push<TextRuleOption>(TextRule, { to: ruleAndPos[1] });
          context.nextInlineRule = ruleAndPos[0];
        }
      }
    }
  }
}

const ListRule: ParseRule<Record<string, unknown>, ListRuleContext> = {
  init,
  name: 'List',
  test: /([#*:;>]+)/gm,
  parse,
};

export default ListRule;
