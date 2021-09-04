/* Enhance from and specially thank to https://github.com/adithya-badidey/TW5-codemirror-plus */
(function(mod) {
    if (typeof exports === "object" && typeof module === "object") // CommonJS
        mod(require("../../lib/codemirror"));
    else if (typeof define === "function" && define.amd) // AMD
        define(["../../lib/codemirror"], mod);
    else // Plain browser env
        mod(CodeMirror);
})(function(CodeMirror) {
    "use strict";

    var functionKey = /macintosh|mac os x/i.test(navigator.userAgent) ? 'metaKey' : 'ctrlKey';
    // 有新的editor实例创建，就Hook一下
    CodeMirror.defineInitHook(function(editor) {
        editor.on("mousedown", function(cm, event) {
            if (event[functionKey]) {
                if ($tw.wiki.getTiddlerText('$:/plugins/Gk0Wk/codemirror-mode-tiddlywiki5/config/clickable-link').toLowerCase() !== "true")
                    return;
                if (event.target.classList.contains("cm-externallink")) {
                    window.open(event.target.innerText);
                } else if (event.target.classList.contains("cm-internallink")) {
                    (new $tw.Story()).navigateTiddler(event.target.innerText);
                }
            }
        });
    });
});
