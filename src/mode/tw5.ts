import CodeMirror, { StringStream, Position } from 'codemirror';
import { ParseRule } from './parserules/rules';
import RootRule from './parserules/root';

export interface TW5ParseContext {
  children: TW5ParseNode[];
  context: Record<string, unknown>;
  rule: ParseRule;
  startPos: Position;
}

export interface TW5ParseNode {
  attributes?: Record<string, unknown>;
  children?: TW5ParseNode[];
  from: Position;
  to: Position;
  token: string;
}

export class TW5ModeState {
  public parseTree: TW5ParseNode[];
  public line: number;
  public contextStack: TW5ParseContext[];
  public shouldParseTree: boolean;
  public stream?: StringStream;
  public parseOptions: Record<string, unknown>;

  constructor(another?: TW5ModeState) {
    if (another === undefined) {
      this.parseTree = [];
      this.line = 0;
      this.contextStack = [];
      this.shouldParseTree = true;
      this.parseOptions = {};
    } else {
      this.parseTree = another.parseTree;
      this.line = another.line;
      this.contextStack = another.contextStack;
      this.shouldParseTree = another.shouldParseTree;
      this.stream = another.stream;
      this.parseOptions = another.parseOptions;
    }
  }

  public pos(): Position {
    return {
      line: this.line,
      ch: this.stream?.pos ?? 0,
    };
  }

  public push(rule: ParseRule): void {
    this.contextStack.push({
      context: {},
      rule,
      startPos: this.pos(),
      children: [],
    });
  }

  public pop(attributes?: Record<string, unknown>): void {
    const context = this.contextStack.pop();
    if (!this.shouldParseTree || context === undefined) return;
    const parentChildrenList = this.top()?.children ?? this.parseTree;
    parentChildrenList.push({
      attributes: attributes,
      children: context.children,
      from: context.startPos,
      to: this.pos(),
      token: context.rule.name,
    });
  }

  public top(): TW5ParseContext | undefined {
    return this.contextStack.length > 0 ? this.contextStack[this.contextStack.length - 1] : undefined;
  }
}

function handleToken(stream: StringStream, state: TW5ModeState): string | null {
  // New line
  if (stream !== state.stream) {
    state.line++;
    state.stream = stream;
  }

  const context = state.top();
  // eslint-disable-next-line unicorn/no-null
  if (context === undefined) return null;
  context.rule.parse(stream, context.context, state);

  return '';
}

CodeMirror.defineMode('tiddlywiki5', (): CodeMirror.Mode<TW5ModeState> => {
  const mode = {
    name: 'tiddlywiki5',
    startState: () => {
      const state = new TW5ModeState();
      state.push(RootRule);
      // In CodeMirror, RootRule context will never pop because the mode will stop immediatly when stream reach the end.
      // So it has to be hacking that make parse tree link to Root's children here.
      state.parseTree = state.contextStack[0].children;
      return state;
    },
    copyState: (oldState: TW5ModeState): TW5ModeState => new TW5ModeState(oldState),
    token: handleToken,
    blankLine: (state: TW5ModeState): void => {
      state.line++;
    },
    indent: (state: TW5ModeState, textAfter: string, line: string): number => 0,
    innerMode: (state: TW5ModeState) => {
      return { state, mode };
    },
    blockCommentStart: '<!--',
    blockCommentEnd: '-->',
    closeBrackets: '()[]{}\'\'""``',
  };
  return mode;
});
