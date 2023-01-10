import { StringStream } from 'codemirror';
import { TW5ModeState } from '../state';

// Parameter Rules
import ImportRule from './params/import';
// Block Rules
import CommentRule from './blocks/comment';
import HeadingRule from './blocks/heading';
import CodeBlockRule from './blocks/codeblock';
import HorizontalRule from './blocks/horizontal';
import ListRule from './blocks/list';
// Inline Rules
import CodeRule from './inline/code';
import DashRule from './inline/dash';
import EntityRule from './inline/entity';
import ExtlinkRule from './inline/extlink';
import BoldRule from './inline/bold';
import ItalicRule from './inline/italic';
import StrikethroughRule from './inline/strikethrough';
import SubscriptRule from './inline/subscript';
import SuperscriptRule from './inline/superscript';
import UnderscoreRule from './inline/underscore';
import LaTeXRuleContext from './inline/latex';
import TranscludeRule from './inline/transclude';
import FilteredTranscludeRule from './inline/filteredtransclude';
import HardLineBreakRuleContext from './inline/haedlinebreak';
import ImageRule from './inline/image';
import MacroCallRule from './inline/macrocall';

export type RuleInitFunction<T = Record<string, unknown>, O = Record<string, unknown>> = (option: O) => T;
// Return -1 if not found, return index(0 ~ stream.string.length-1) if found
export type RuleTestFunction = (stream: StringStream, nearMode: boolean, getFullText?: () => [string, number]) => number;
export type RuleParseFunction<T = Record<string, unknown>> = (stream: StringStream, modeState: TW5ModeState, context: T) => void;

export interface ParseRule<O = Record<string, unknown>, T = Record<string, unknown>> {
  init: RuleInitFunction<T, O>;
  name: string;
  parse: RuleParseFunction<T>;
  test: RuleTestFunction | string | RegExp;
}

export const ParametersRules: unknown[] = [CommentRule, ImportRule];
export const BlockRules: unknown[] = [CommentRule, HeadingRule, CodeBlockRule, HorizontalRule, ListRule];
export const InlineRules: unknown[] = [
  CommentRule,
  CodeRule,
  DashRule,
  EntityRule,
  ExtlinkRule,
  BoldRule,
  ItalicRule,
  StrikethroughRule,
  SubscriptRule,
  SuperscriptRule,
  UnderscoreRule,
  LaTeXRuleContext,
  TranscludeRule,
  FilteredTranscludeRule,
  HardLineBreakRuleContext,
  ImageRule,
  MacroCallRule,
];
