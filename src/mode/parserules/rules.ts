import { StringStream } from 'codemirror';
import { TW5ModeState } from '../state';
import CommentRule from './blocks/comment';
import ImportRule from './params/import';
import HeadingRule from './blocks/heading';
import CodeBlockRule from './blocks/codeblock';

export type RuleInitFunction<T = Record<string, unknown>, O = Record<string, unknown>> = (option: O) => T;
// Return -1 if not found, return index(0 ~ stream.string.length-1) if found
export type RuleTestFunction = (stream: StringStream, nearMode: boolean) => number;
export type RuleParseFunction<T = Record<string, unknown>> = (stream: StringStream, modeState: TW5ModeState, context: T) => void;

export interface ParseRule<O = Record<string, unknown>, T = Record<string, unknown>> {
  init: RuleInitFunction<T, O>;
  name: string;
  parse: RuleParseFunction<T>;
  test: RuleTestFunction | string | RegExp;
}

export const ParametersRules: unknown[] = [CommentRule, ImportRule];
export const BlockRules: unknown[] = [CommentRule, HeadingRule, CodeBlockRule];
export const InlineRules: unknown[] = [CommentRule];
