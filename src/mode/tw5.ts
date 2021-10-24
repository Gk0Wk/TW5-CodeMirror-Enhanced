import CodeMirror, { StringStream, Position } from 'codemirror';
import { ParseRule } from './parserules/rules';
import RootRule from './parserules/root';
import WhitespaceRule, { WhitespaceRuleOption } from './parserules/inner/whitespace';

export interface TW5ParseContext<T = Record<string, unknown>, O = Record<string, unknown>> {
  children: TW5ParseNode[];
  context: Record<string, unknown>;
  node?: TW5ParseNode;
  rule: ParseRule<T, O>;
}

export interface TW5ParseNode {
  attributes?: Record<string, unknown>;
  children?: TW5ParseNode[];
  from: Position;
  to: Position;
  token: string;
}

export class TW5ModeState {
  public readonly parseTree: TW5ParseNode[];
  public line: number;
  public readonly maxPos: Position;
  public readonly contextStack: TW5ParseContext[];
  public readonly shouldParseTree: boolean;
  public stream?: StringStream;
  public readonly parseOptions: Record<string, unknown>;
  public justPoped?: TW5ParseContext;

  constructor(another?: TW5ModeState) {
    if (another === undefined) {
      this.parseTree = [];
      this.line = 0;
      this.contextStack = [];
      this.shouldParseTree = true;
      this.parseOptions = {};
      this.maxPos = { line: 0, ch: 0 };
      this.justPoped = undefined;
    } else {
      this.parseTree = another.parseTree;
      this.line = another.line;
      this.contextStack = another.contextStack;
      this.shouldParseTree = another.shouldParseTree;
      this.stream = another.stream;
      this.parseOptions = another.parseOptions;
      this.maxPos = another.maxPos;
      this.justPoped = another.justPoped;
    }
  }

  public pos(): Position {
    return {
      line: this.line,
      ch: this.stream?.pos ?? 0,
    };
  }

  public push<T = Record<string, unknown>>(rule: unknown, options?: T): void {
    // Make new context
    const newContext: TW5ParseContext<T> = {
      context: options ?? {},
      rule: rule as ParseRule<T>,
      children: [],
    };
    // Build parse tree
    if (this.shouldParseTree && (rule as ParseRule<T>).name !== '') {
      const parentChildrenList = this.top()?.children ?? this.parseTree;
      const newNode = {
        attributes: {},
        children: newContext.children,
        from: this.pos(),
        to: this.maxPos,
        token: (rule as ParseRule<T>).name,
      };
      newContext.node = newNode;
      parentChildrenList.push(newNode);
    }
    // Push context to the stack
    this.contextStack.push(newContext as unknown as TW5ParseContext);
  }

  public pop(): void {
    this.justPoped = this.contextStack.pop();
    if (this.justPoped?.node !== undefined) this.justPoped.node.to = this.pos();
  }

  public top<T = Record<string, unknown>>(): TW5ParseContext<T> | undefined {
    return this.contextStack.length > 0 ? (this.contextStack[this.contextStack.length - 1] as unknown as TW5ParseContext<T>) : undefined;
  }

  public setArrtibute(key: string, value: unknown): void {
    const node = this.top()?.node;
    if (node !== undefined) {
      if (node.attributes === undefined) node.attributes = {};
      node.attributes[key] = value;
    }
  }

  public skipWhitespace(inlineMode: boolean): void {
    this.push<WhitespaceRuleOption>(WhitespaceRule, { inlineMode });
  }
}

function handleToken(stream: StringStream, state: TW5ModeState): string | null {
  // New line
  if (stream !== state.stream) {
    state.line++;
    state.stream = stream;
    state.maxPos.line++;
    state.maxPos.ch = stream.string.length;
  }

  const context = state.top();
  // eslint-disable-next-line unicorn/no-null
  if (context === undefined) return null; // This line will never be executed

  // Run non-empty parse
  const originalPos = stream.pos;
  do context.rule.parse(stream, state, context.context);
  while (originalPos === stream.pos && !stream.eol());

  // Token generation
  if (state.justPoped !== undefined) {
    state.contextStack.push(state.justPoped);
  }

  // eslint-disable-next-line unicorn/no-null
  const token = state.contextStack[state.contextStack.length - 1]?.rule.name ?? null;

  if (state.justPoped !== undefined) {
    state.contextStack.pop();
    state.justPoped = undefined;
  }

  return token;
}

CodeMirror.defineMode('tiddlywiki5', (): CodeMirror.Mode<TW5ModeState> => {
  const mode = {
    name: 'tiddlywiki5',
    startState: () => {
      const state = new TW5ModeState();
      state.push(RootRule);
      return state;
    },
    copyState: (oldState: TW5ModeState): TW5ModeState => new TW5ModeState(oldState),
    token: handleToken,
    blankLine: (state: TW5ModeState): void => {
      state.line++;
      state.maxPos.line++;
      state.maxPos.ch = 0;
    },
    // indent: (state: TW5ModeState, textAfter: string, line: string): number => 0,
    innerMode: (state: TW5ModeState) => {
      return { state, mode };
    },
    blockCommentStart: '<!--',
    blockCommentEnd: '-->',
    closeBrackets: '()[]{}\'\'""``',
  };
  return mode;
});
