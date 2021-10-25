import { StringStream, Position } from 'codemirror';
import { ParseRule } from './parserules/rules';
import BlankRule, { BlankRuleOption } from './parserules/inner/blank';

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
    this.push<BlankRuleOption>(BlankRule, { inlineMode });
  }
}
