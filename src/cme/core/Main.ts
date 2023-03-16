// Modules
import { init as initTiddlerMerge } from './TiddlerMerge';
import { init as initEditor } from './Editor';
import { init as initServiceManager } from './services/ServiceManager';

// Services
import { init as initClickableToken } from './services/clickable/ClickableToken';
import { init as initRealtimeHint } from './services/hint/RealtimeHint';
import { init as initSnippetsList } from './services/snippetslist/SnippetsList';

import CodeMirror from '$:/plugins/tiddlywiki/codemirror/lib/codemirror.js';

const api: Record<string, unknown> = {
  CodeMirror,
  tiddlerMerge: initTiddlerMerge(),
  editor: initEditor(),
};
api.service = initServiceManager(api);
initClickableToken();
initRealtimeHint();
initSnippetsList();

(globalThis as any).$cme = api;
