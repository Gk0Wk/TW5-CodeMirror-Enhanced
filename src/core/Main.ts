// CodeMirror
import CodeMirror from 'codemirror';

// Modules
import { init as initTiddlerMerge } from './TiddlerMerge';
import { init as initEditor } from './Editor';
import { init as initServiceManager } from './services/ServiceManager';

// Services
import { init as initClickableToken } from './services/clickable/ClickableToken';
import { init as initRealtimeHint } from './services/hint/RealtimeHint';
import { init as initSnippetsList } from './services/snippetslist/SnippetsList';

const api: Record<string, unknown> = {};
api.CodeMirror = CodeMirror;
api.tiddlerMerge = initTiddlerMerge();
api.editor = initEditor();
api.service = initServiceManager(api);
initClickableToken();
initRealtimeHint();
initSnippetsList();

// Get global
const selfGlobal = (window === undefined ? globalThis : window) as Record<string, unknown>;
selfGlobal.$cme = api;
export default api;
