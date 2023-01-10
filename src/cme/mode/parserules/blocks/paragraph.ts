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

  // Find Terminator   - Whether there is a special terminator
  let terminatorPos = stream.string.length;
  if (context.terminator !== undefined) {
    // The paragraph should end up with a special terminator
    context.terminator.lastIndex = stream.pos;
    const match = context.terminator.exec(stream.string);
    if (match !== null) terminatorPos = match.index;
    if (terminatorPos === stream.pos) {
      modeState.pop();
      return;
    }
  } else {
    // The paragraph has no special terminator
    if (!context.firstIn && modeState.prevLine.stream === undefined) {
      modeState.pop();
      return;
    } else if (stream.string.trim() === '') {
      modeState.pop();
      modeState.push(TextRule, {}, 'WrongText');
      return;
    }
    context.firstIn = false;
  }

  // Find the next occurrence of a inlinerule
  const ruleAndPos = findNearestRule(InlineRules as ParseRule[], stream);
  // Process any inline rule, along with the text preceding it
  if (ruleAndPos === undefined) {
    modeState.push<TextRuleOption>(TextRule);
  } else if (ruleAndPos[1] === stream.pos) {
    modeState.push(ruleAndPos[0]);
  } else {
    // pos of inline rule > stream.pos
    if (terminatorPos <= ruleAndPos[1]) {
      // terminator appears before the inline rule
      modeState.push<TextRuleOption>(TextRule, { to: terminatorPos });
    } else {
      // inline rule first
      modeState.push<TextRuleOption>(TextRule, { to: ruleAndPos[1] });
      context.nextInlineRule = ruleAndPos[0];
    }
  }
}

const ParagraphRule: ParseRule<ParagraphRuleOption, ParagraphRuleContext> = {
  init,
  name: 'Paragraph',
  test: '',
  parse,
};

export default ParagraphRule;
