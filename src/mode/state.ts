import { StringStream, Position } from 'codemirror';
import { ParseRule } from './parserules/rules';
import BlankRule, { BlankRuleOption } from './parserules/inner/blank';
import { arrayEach } from './utils';

interface LineStreamStorage {
  stream?: StringStream;
}

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
  public readonly parseOptions: Record<string, unknown>;
  public justPoped?: TW5ParseContext;
  public prevLine: LineStreamStorage;
  public thisLine: LineStreamStorage;

  constructor(another?: TW5ModeState) {
    if (another === undefined) {
      this.parseTree = [];
      this.line = 0;
      this.contextStack = [];
      this.shouldParseTree = true;
      this.parseOptions = {};
      this.maxPos = { line: 0, ch: 0 };
      this.justPoped = undefined;
      this.prevLine = { stream: undefined };
      this.thisLine = { stream: undefined };
    } else {
      this.parseTree = another.parseTree;
      this.line = another.line;
      this.contextStack = [];
      arrayEach<TW5ParseContext>(another.contextStack, (context) => {
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
    }
  }

  public pos(): Position {
    return {
      line: this.line,
      ch: this.thisLine.stream?.pos ?? 0,
    };
  }

  public push<T = Record<string, unknown>>(rule: unknown, options?: T): void {
    // Make new context
    const newContext: TW5ParseContext<T> = {
      context: (rule as ParseRule<T>).init(options ?? ({} as unknown as T)),
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
    const justPoped = this.contextStack.pop();
    if (justPoped?.node !== undefined) justPoped.node.to = this.pos();
    this.justPoped = justPoped;
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
    this.push<BlankRuleOption>(BlankRule, { inlineMode });
  }
}
