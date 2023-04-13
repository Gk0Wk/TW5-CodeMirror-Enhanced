import { StringStream } from 'codemirror';
import { TW5ModeState } from '../../state';
import { ParseRule } from '../rules';
import TextRule, { TextRuleOption } from '../inner/text';
import ParagraphRule, { ParagraphRuleOption } from '../blocks/paragraph';

interface HardLineBreakRuleContext {
  stage: number;
}

function init(): HardLineBreakRuleContext {
  return {
    stage: 0,
  };
}

function parse(stream: StringStream, modeState: TW5ModeState, context: HardLineBreakRuleContext): void {
  switch (context.stage) {
    case 0: {
      modeState.push<TextRuleOption>(TextRule, { to: stream.pos + 3 }, 'HardLineBreakBorderLeft');
      context.stage++;
      return;
    }
    case 1: {
      modeState.push<ParagraphRuleOption>(ParagraphRule, { terminator: /"""/gm });
      context.stage++;
      return;
    }
    case 2: {
      modeState.push<TextRuleOption>(TextRule, { to: stream.pos + 3 }, 'HardLineBreakBorderRight');
      context.stage++;
      return;
    }
    default: {
      modeState.pop();
    }
  }
}

const HardLineBreakRule: ParseRule<Record<string, unknown>, HardLineBreakRuleContext> = {
  init,
  name: 'HardLineBreak',
  test: '"""',
  parse,
};

export default HardLineBreakRule;
