/* eslint-disable @typescript-eslint/lines-between-class-members */
import { StringStream, Position, EditorConfiguration, Mode } from 'codemirror';
import { ParseRule } from './parserules/rules';
import BlankRule, { BlankRuleOption } from './parserules/inner/blank';
import { arrayEach } from './utils';

declare const development: unknown;
const development_ =
  typeof development === 'undefined' ? false : development === true;

interface LineStreamStorage {
  stream?: StringStream;
}

interface ModeAndState<T = unknown> {
  isLaTeX: boolean;
  mode: Mode<T>;
  state: T;
}

export interface TW5ParseContext<
  T = Record<string, unknown>,
  O = Record<string, unknown>,
> {
  children: TW5ParseNode[];
  context: Record<string, unknown>;
  node?: TW5ParseNode;
  overrideName?: string;
  rule: ParseRule<T, O>;
}

export interface TW5ParseNode {
  attributes?: Record<string, unknown>;
  children?: TW5ParseNode[];
  from: Position;
  overrideName?: string;
  to: Position;
  token: string;
}

export class TW5ModeState {
  public readonly parseTree: TW5ParseNode[];
  public line: number;
  public readonly maxPos: Position;
  public readonly contextStack: TW5ParseContext[];
  public readonly shouldParseTree: boolean;
  public readonly parseOptions: Record<string, unknown>;
  public justPoped?: TW5ParseContext;
  public prevLine: LineStreamStorage;
  public thisLine: LineStreamStorage;
  public cmCfg?: EditorConfiguration;
  public innerMode?: ModeAndState;
  public readonly cmVersion: '5' | 'next';

  constructor(another?: TW5ModeState, _cmVersion: '5' | 'next' = '5') {
    const cmVersion: '5' | 'next' = ['5', 'next'].includes(_cmVersion)
      ? _cmVersion
      : '5';
    if (another === undefined) {
      this.parseTree = [];
      this.line = 0;
      this.contextStack = [];
      this.shouldParseTree = development_;
      this.parseOptions = {};
      this.maxPos = { line: 0, ch: 0 };
      this.justPoped = undefined;
      this.prevLine = { stream: undefined };
      this.thisLine = { stream: undefined };
      this.cmVersion = cmVersion;
    } else {
      this.parseTree = another.parseTree;
      this.line = another.line;
      this.contextStack = [];
      arrayEach<TW5ParseContext>(another.contextStack, context => {
        this.contextStack.push({
          children: context.children,
          context: { ...context.context },
          node: { ...context.node } as unknown as TW5ParseNode,
          rule: context.rule,
        });
        return true;
      });
      this.shouldParseTree = another.shouldParseTree;
      this.parseOptions = { ...another.parseOptions };
      this.maxPos = { line: another.maxPos.line, ch: another.maxPos.ch };
      this.justPoped = undefined;
      this.prevLine = another.prevLine;
      this.thisLine = another.thisLine;
      this.cmCfg = another.cmCfg;
      this.innerMode =
        another.innerMode === undefined
          ? undefined
          : {
              isLaTeX: another.innerMode.isLaTeX,
              mode: another.innerMode.mode,
              state:
                another.innerMode.mode.copyState?.(another.innerMode.state) ??
                another.innerMode.state,
            };
      this.cmVersion = another.cmVersion;
    }
  }

  public pos(): Position {
    return {
      line: this.line,
      ch: this.thisLine.stream?.pos ?? 0,
    };
  }

  public push<T = Record<string, unknown>>(
    rule: unknown,
    options: T = {} as unknown as T,
    overrideName?: string,
  ): void {
    // Make new context
    const newContext: TW5ParseContext<T> = {
      context: (rule as ParseRule<T>).init(options),
      rule: rule as ParseRule<T>,
      children: [],
      overrideName,
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
        overrideName,
      };
      newContext.node = newNode;
      parentChildrenList.push(newNode);
    }
    // Push context to the stack
    this.contextStack.push(newContext as unknown as TW5ParseContext);
  }

  public pop(): void {
    const justPoped = this.contextStack.pop();
    if (justPoped?.node !== undefined) {
      justPoped.node.to = this.pos();
    }
    this.justPoped = justPoped;
  }

  public top<T = Record<string, unknown>>(): TW5ParseContext<T> | undefined {
    return this.contextStack.length > 0
      ? (this.contextStack[
          this.contextStack.length - 1
        ] as unknown as TW5ParseContext<T>)
      : undefined;
  }

  public setArrtibute(key: string, value: unknown): void {
    if (!this.shouldParseTree) {
      return;
    }
    const node = this.top()?.node;
    if (node !== undefined) {
      node.attributes ??= {};
      node.attributes[key] = value;
    }
  }

  public skipWhitespace(inlineMode: boolean): void {
    this.push<BlankRuleOption>(BlankRule, { inlineMode });
  }
}
/* eslint-enable @typescript-eslint/lines-between-class-members */
