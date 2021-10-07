// TiddlerMerge
import { init as initTiddlerMerge } from './TiddlerMerge';

// Editor
import { init as initEditor } from './Editor';

// Service Manager
import { init as initServiceManager } from './services/ServiceManager';
// Services
import { init as initClickableToken } from './services/clickable/ClickableToken';
import { init as initRealtimeHint } from './services/hint/RealtimeHint';
import { init as initSnippetsList } from './services/snippetslist/SnippetsList';

declare function require(path: string): unknown;

const CodeMirror = require('$:/plugins/tiddlywiki/codemirror/lib/codemirror.js');
const api: Record<string, unknown> = {
  CodeMirror,
};
api.tiddlerMerge = initTiddlerMerge(CodeMirror);
api.editor = initEditor(CodeMirror);
api.service = initServiceManager(CodeMirror, api);
initClickableToken();
initRealtimeHint();
initSnippetsList();

if (window !== undefined) window.$cme = api;
export default api;
