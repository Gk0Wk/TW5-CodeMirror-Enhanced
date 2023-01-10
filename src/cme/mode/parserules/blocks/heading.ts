import { StringStream } from 'codemirror';
import { TW5ModeState } from '../../state';
import { ParseRule, InlineRules } from '../rules';
import { findNearestRule } from '../../utils';
import TextRule, { TextRuleOption } from '../inner/text';
import StyleClassRule from '../inner/styleclass';

interface HeadingRuleContext {
  justParsedAInlineRule: boolean;
  level: number;
  line: number;
  nextInlineRule?: ParseRule;
  stage: number;
}

function init(): HeadingRuleContext {
  return {
    justParsedAInlineRule: false,
    level: 0,
    stage: 0,
    line: 0,
  };
}

function parse(stream: StringStream, modeState: TW5ModeState, context: HeadingRuleContext): void {
  switch (context.stage) {
    case 0: {
      // !+
      context.stage++;
      (HeadingRule.test as RegExp).lastIndex = stream.pos;
      const length = ((HeadingRule.test as RegExp).exec(stream.string) as RegExpExecArray)[1].length;
      modeState.push<TextRuleOption>(TextRule, { to: stream.pos + length }, 'HeadingHeader');
      context.level = length;
      stream.pos += context.level;
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
      // Heading content
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

const HeadingRule: ParseRule<Record<string, unknown>, HeadingRuleContext> = {
  init,
  name: 'Heading',
  test: /(!{1,6})/gm,
  parse,
};

export default HeadingRule;
