import { TW5ModeState } from '../tw5';
import { StringStream } from 'codemirror';

export type RuleTestFunction = (text: string) => boolean;
export type RuleParseFunction = (stream: StringStream, context: Record<string, unknown>, modeState: TW5ModeState) => void;

export interface ParseRule {
  name: string;
  parse: RuleParseFunction;
  test: RuleTestFunction | string | RegExp;
}

export const ParametersRules: Record<string, ParseRule> = {};
export const BlockRules: Record<string, ParseRule> = {};
export const InlineRules: Record<string, ParseRule> = {};
