declare var $tw: any;
declare function require(path: string): any;

const CodeMirror = require("$:/plugins/tiddlywiki/codemirror/lib/codemirror.js");
let api = {
  CodeMirror: CodeMirror,
};

// Service Manager
import { init as initServiceManager } from "./services/ServiceManager";
api["service"] = initServiceManager(CodeMirror, api);
// Services
import { init as initClickableToken } from "./services/clickable/ClickableToken";
initClickableToken();
import { init as initRealtimeHint } from "./services/hint/RealtimeHint";
initRealtimeHint();
import { init as initSnippetsList } from "./services/snippetslist/SnippetsList";
initSnippetsList();

// Editor
import { init as initEditor } from "./Editor";
api["editor"] = initEditor(CodeMirror);

if (window) window["$cme"] = api;
export default api;
