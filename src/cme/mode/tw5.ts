import CodeMirror, { StringStream, EditorConfiguration } from 'codemirror';
import { TW5ModeState } from './state';
import RootRule, { RootRuleOption } from './parserules/root';

declare const development: unknown;
const development_ =
  typeof development === 'undefined' ? false : development === true;

function handleToken(stream: StringStream, state: TW5ModeState): string | null {
  // New line
  if (stream !== state.thisLine.stream) {
    state.line++;
    state.prevLine = state.thisLine;
    state.thisLine = { stream };
    state.maxPos.line++;
    state.maxPos.ch = stream.string.length;
  }

  // Run non-empty parse
  const originalPos = stream.pos;
  do {
    state.justPoped = undefined;
    const context = state.top();
    // This line will never be executed
    if (context === undefined) {
      return null;
    }
    context.rule.parse(stream, state, context.context);
    // Parse with inner mode
    if (state.innerMode !== undefined) {
      const token = state.innerMode.mode.token(stream, state.innerMode.state);
      return `${
        token === null ? '' : token
      } line-background-cm-code-block-line`;
    }
  } while (originalPos === stream.pos && !stream.eol());

  // Token generation
  if (state.justPoped !== undefined) {
    state.contextStack.push(state.justPoped);
  }

  const context = state.contextStack[state.contextStack.length - 1];
  const token = context?.overrideName ?? context?.rule.name ?? null;

  if (state.justPoped !== undefined) {
    state.contextStack.pop();
  }

  return token;
}

// For CodeMirror 6(Next)
export const mkTW5 = (
  cmCfg: EditorConfiguration,
): CodeMirror.Mode<TW5ModeState> => {
  const mode = {
    name: 'tiddlywiki5',
    startState: () => {
      const state = new TW5ModeState();
      state.push<RootRuleOption>(RootRule, { parseParams: true });
      state.cmCfg = cmCfg;
      if (development_) {
        (globalThis as any).state = state;
      }
      return state;
    },
    copyState: (oldState: TW5ModeState): TW5ModeState =>
      new TW5ModeState(oldState),
    token: handleToken,
    blankLine: (state: TW5ModeState): void => {
      state.line++;
      state.maxPos.line++;
      state.maxPos.ch = 0;
      state.prevLine = state.thisLine;
      state.thisLine = { stream: undefined };
    },
    indent: (state: TW5ModeState, textAfter: string, line: string): number => {
      if (
        state.innerMode !== undefined &&
        typeof state.innerMode.mode.indent === 'function'
      ) {
        return state.innerMode.mode.indent(
          state.innerMode.state,
          textAfter,
          line,
        );
      }
      return 0;
    },
    innerMode: (state: TW5ModeState) =>
      state.innerMode !== undefined ? state.innerMode : { state, mode },
    blockCommentStart: '<!--',
    blockCommentEnd: '-->',
    closeBrackets: '()[]{}\'\'""``',
  };
  return mode;
};

// For CodeMirror 5
if (CodeMirror?.defineMode !== undefined) {
  CodeMirror.defineMode('tiddlywiki5', mkTW5);

  CodeMirror.defineMIME('text/vnd.tiddlywiki', 'tiddlywiki5');
  CodeMirror.defineMIME('', 'tiddlywiki5');

  CodeMirror.defineMIME('text/x-tex', 'stex');
  CodeMirror.defineMIME('tex', 'stex');
}

if (development_) {
  // eslint-disable-next-line no-console
  console.debug('CME Development mode.');
}
