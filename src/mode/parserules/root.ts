import { ParseRule, ParametersRules, BlockRules, InlineRules } from './rules';
import { StringStream } from 'codemirror';

function rootParse(stream: StringStream, context: Record<string, unknown>): void {}

export default {
  name: 'Root',
  test: '',
  parse: rootParse,
};
