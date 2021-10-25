import CodeMirror, { StringStream } from 'codemirror';
import { TW5ModeState } from './state';
import RootRule from './parserules/root';

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
