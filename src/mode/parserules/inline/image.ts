import { StringStream } from 'codemirror';
import { TW5ModeState } from '../../state';
import { ParseRule } from '../rules';
import TextRule, { TextRuleOption } from '../inner/text';
import { isUrl } from '../../utils';

interface ImageRuleContext {
  match?: RegExpExecArray;
  stage: number;
}

function init(): ImageRuleContext {
  return {
    stage: 0,
  };
}

function parse(stream: StringStream, modeState: TW5ModeState, context: ImageRuleContext): void {
  if (context.match === undefined) {
    (ImageRule.test as RegExp).lastIndex = stream.pos;
    context.match = (ImageRule.test as RegExp).exec(stream.string) as RegExpExecArray;
  }
  switch (context.stage) {
    case 0: {
      modeState.push<TextRuleOption>(TextRule, { to: stream.pos + 4 }, 'ImageBorderLeft1');
      context.stage++;
      return;
    }
    case 1: {
      if (context.match[1] !== undefined) {
        modeState.push<TextRuleOption>(TextRule, { to: stream.pos + context.match[1].length }, 'ImageAttributes');
      }
      context.stage++;
      return;
    }
    case 2: {
      modeState.push<TextRuleOption>(TextRule, { to: stream.pos + 1 }, 'ImageBorderLeft2');
      context.stage++;
      return;
    }
    case 3: {
      switch (isUrl(context.match[2].trim())) {
        case 2: {
          modeState.push<TextRuleOption>(TextRule, { to: stream.pos + context.match[2].length }, 'Url');
          break;
        }
        case 1: {
          modeState.push<TextRuleOption>(TextRule, { to: stream.pos + context.match[2].length }, 'WrongUrl');
          break;
        }
        default: {
          modeState.push<TextRuleOption>(TextRule, { to: stream.pos + context.match[2].length }, 'Tiddler');
        }
      }
      context.stage++;
      return;
    }
    case 4: {
      modeState.push<TextRuleOption>(TextRule, { to: stream.pos + 2 }, 'ImageBorderRight');
      context.stage++;
      return;
    }
    default: {
      modeState.pop();
    }
  }
}

const ImageRule: ParseRule<Record<string, unknown>, ImageRuleContext> = {
  init,
  name: 'Image',
  test: /\[img([^\]]+)?\[([^\]]*)]]/gm,
  parse,
};

export default ImageRule;
