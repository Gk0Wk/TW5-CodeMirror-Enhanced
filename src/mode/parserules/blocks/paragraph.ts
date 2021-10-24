import { StringStream } from 'codemirror';
import { TW5ModeState } from '../../tw5';
import { ParseRule, InlineRules } from '../rules';
import { findNearestRule } from '../../utils';
import TextRule, { TextRuleOption } from '../inner/text';

export interface ParagraphRuleOption {
  terminator?: RegExp;
}

interface ParagraphRuleContext {
  nextInlineRule?: ParseRule;
  terminator: RegExp;
}

function init(options: ParagraphRuleOption): ParagraphRuleContext {
  return {
    nextInlineRule: undefined,
    terminator: options.terminator ?? /^\r?$/,
  };
}

function parse(stream: StringStream, modeState: TW5ModeState, context: ParagraphRuleContext): void {
  // Process the inline rule found previously
  if (context.nextInlineRule !== undefined) {
    modeState.push(context.nextInlineRule);
    context.nextInlineRule = undefined;
    return;
  }
  // Return if we've found the terminator
  context.terminator.lastIndex = stream.pos;
  if (context.terminator.test(stream.string)) {
    modeState.pop();
    return;
  }
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

const ParagraphRule: ParseRule<ParagraphRuleContext, ParagraphRuleOption> = {
  init,
  name: 'Paragraph',
  test: '',
  parse,
};

export default ParagraphRule;
