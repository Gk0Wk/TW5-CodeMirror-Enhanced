import { StringStream } from 'codemirror';
import { TW5ModeState } from '../../state';
import { ParseRule, InlineRules } from '../rules';
import { findNearestRule } from '../../utils';
import TextRule, { TextRuleOption } from '../inner/text';

export interface ParagraphRuleOption {
  terminator?: RegExp;
}

interface ParagraphRuleContext {
  firstIn: boolean;
  line: number;
  nextInlineRule?: ParseRule;
  terminator?: RegExp;
}

function init(options: ParagraphRuleOption): ParagraphRuleContext {
  return {
    firstIn: true,
    line: -1,
    nextInlineRule: undefined,
    terminator: options.terminator,
  };
}

function parse(stream: StringStream, modeState: TW5ModeState, context: ParagraphRuleContext): void {
  if (context.line < 0) context.line = modeState.line;
  // Process the inline rule found previously
  if (context.nextInlineRule !== undefined) {
    modeState.push(context.nextInlineRule);
    context.nextInlineRule = undefined;
    return;
  }
  // Return if we've found the terminator
  if (context.terminator !== undefined) {
    context.terminator.lastIndex = stream.pos;
    if (context.terminator.test(stream.string)) {
      modeState.pop();
      return;
    }
  } else {
    if (!context.firstIn && modeState.prevLine.stream === undefined) {
      modeState.pop();
      return;
    }
  }
  context.firstIn = false;
  // Find the next occurrence of a inlinerule
  const ruleAndPos = findNearestRule(InlineRules as ParseRule[], stream);
  // Process any inline rule, along with the text preceding it
  if (ruleAndPos === undefined) {
    modeState.push<TextRuleOption>(TextRule);
  } else if (ruleAndPos[1] > stream.pos) {
    modeState.push<TextRuleOption>(TextRule, { to: ruleAndPos[1] });
    context.nextInlineRule = ruleAndPos[0];
  } else {
    modeState.push(context.nextInlineRule);
  }
}

const ParagraphRule: ParseRule<ParagraphRuleOption, ParagraphRuleContext> = {
  init,
  name: 'Paragraph',
  test: '',
  parse,
};

export default ParagraphRule;
