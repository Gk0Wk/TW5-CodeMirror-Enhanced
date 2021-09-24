declare var $tw: any;
declare function require(path: string): any;

const CodeMirror = require("$:/plugins/tiddlywiki/codemirror/lib/codemirror.js");

import { init as initServiceManager } from "./services/ServiceManager";
initServiceManager(CodeMirror);

// Services
import { init as initClickableToken } from "./services/clickable/ClickableToken";
initClickableToken();
import { init as initRealtimeHint } from "./services/hint/RealtimeHint";
initRealtimeHint();
