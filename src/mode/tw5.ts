import CodeMirror, { StringStream } from 'codemirror';
import { TW5ModeState } from './state';
import RootRule, { RootRuleOption } from './parserules/root';

function handleToken(stream: StringStream, state: TW5ModeState): string | null {
  // New line
  if (stream !== state.thisLine.stream) {
    state.line++;
    state.prevLine = state.thisLine;
    state.thisLine = { stream: stream };
    state.maxPos.line++;
    state.maxPos.ch = stream.string.length;
  }

  // Run non-empty parse
  const originalPos = stream.pos;
  do {
    state.justPoped = undefined;
    const context = state.top();
    // eslint-disable-next-line unicorn/no-null
    if (context === undefined) return null; // This line will never be executed
    context.rule.parse(stream, state, context.context);
  } while (originalPos === stream.pos && !stream.eol());

  // Token generation
  if (state.justPoped !== undefined) {
    state.contextStack.push(state.justPoped);
  }

  // eslint-disable-next-line unicorn/no-null
  const token = state.contextStack[state.contextStack.length - 1]?.rule.name ?? null;

  if (state.justPoped !== undefined) {
    state.contextStack.pop();
  }

  return token;
}

CodeMirror.defineMode('tiddlywiki5', (): CodeMirror.Mode<TW5ModeState> => {
  const mode = {
    name: 'tiddlywiki5',
    startState: () => {
      const state = new TW5ModeState();
      state.push<RootRuleOption>(RootRule, { parseParams: true });
      window.state = state;
      return state;
    },
    copyState: (oldState: TW5ModeState): TW5ModeState => new TW5ModeState(oldState),
    token: handleToken,
    blankLine: (state: TW5ModeState): void => {
      state.line++;
      state.maxPos.line++;
      state.maxPos.ch = 0;
      state.prevLine = state.thisLine;
      state.thisLine = { stream: undefined };
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

CodeMirror.defineMIME('text/vnd.tiddlywiki', 'tiddlywiki5');
CodeMirror.defineMIME('', 'tiddlywiki5');
