// TiddlerMerge
import { init as initTiddlerMerge } from './TiddlerMerge';

// Editor
import { init as initEditor } from './Editor';

// i18n
import { init as initI18n } from './i18n';

// Service Manager
import { init as initServiceManager } from './services/ServiceManager';
// Services
import { init as initClickableToken } from './services/clickable/ClickableToken';
import { init as initRealtimeHint } from './services/hint/RealtimeHint';
import { init as initSnippetsList } from './services/snippetslist/SnippetsList';

declare let $tw: any;
declare function require(path: string): any;

const CodeMirror = require('$:/plugins/tiddlywiki/codemirror/lib/codemirror.js');
const api = {
  CodeMirror: CodeMirror,
};
api.tiddlerMerge = initTiddlerMerge(CodeMirror);
api.editor = initEditor(CodeMirror);
api.i18n = initI18n(CodeMirror);
api.service = initServiceManager(CodeMirror, api);
initClickableToken();
initRealtimeHint();
initSnippetsList();

if (window) window.$cme = api;
export default api;
