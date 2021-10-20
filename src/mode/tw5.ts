import CodeMirror from 'codemirror';

interface ParserContext {
  parse(context: ParserContext, state: ParserContext): void;
}

class ParserState {
  public parseTree: unknown[];
  public pos: number;
  public stateStack: unknown[];

  constructor() {
    this.parseTree = [];
    this.pos = 0;
    this.stateStack = [];
  }
  public push(): void {

  }
  public pop(): unknown {

  }
  public top(): unknown {

  }
}

CodeMirror.defineMode('tiddlywiki5', (config: CodeMirror.EditorConfiguration): CodeMirror.Mode<ParserState> => {
  return new ParserState();
});
