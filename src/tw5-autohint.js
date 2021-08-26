(function(mod) {
    if (typeof exports === "object" && typeof module === "object") // CommonJS
        mod(require("../../lib/codemirror"));
    else if (typeof define === "function" && define.amd) // AMD
        define(["../../lib/codemirror"], mod);
    else // Plain browser env
        mod(CodeMirror);
})(function(CodeMirror) {
    "use strict";

    // 有新的editor实例创建，就Hook一下，达到实时提示的效果
    CodeMirror.defineInitHook(function (editor) {
        // 如果补全建议中只有一个，不会自动补全，否则体验会非常糟糕
        editor.options.hintOptions = {
            completeSingle: false
        };
        // 当光标移动(输入、删除、光标移动)时进行补全
        editor.on("change", function (cm, event) {
            if (!cm.state.completeActive && typeof cm.showHint === 'function') {
                cm.showHint();
            }
        });
    });

    // TiddlyWiki5 补全
    CodeMirror.registerHelper('hint', 'tiddlywiki5', function(editor) {
        var cur = editor.getCursor();
        var curLine = editor.getLine(cur.line);
        var pointer = cur.ch;
        var end = cur.ch;
        var max_length = 30;

        // wikilin匹配
        // 向前找，找到[{|"为止，而如果找到]}.>或者到头，就不要继续找
        var escapeChars = ['.', ']', '}', '>'];
        var stopChars = ['[', '{', '|', '"'];
        while (pointer) {
            var ch = curLine.charAt(pointer - 1);
            if (end - pointer > max_length || escapeChars.includes(ch)) {
                return null;
            }
            if (!(stopChars.includes(ch))) {
                pointer--;
            } else {
                break;
            }
        }
        if (pointer == 0) return null;
        var curWord = pointer !== end && curLine.slice(pointer, end);
        if (curLine.charAt(pointer) == '$') {
            return {
                list: $tw.wiki.filterTiddlers(`[all[tiddlers]search:title:literal[${curWord}]!prefix[$:/state]]`),
                from: CodeMirror.Pos(cur.line, pointer),
                to: CodeMirror.Pos(cur.line, end)
            };
        } else {
            return {
                list: $tw.wiki.filterTiddlers(`[all[tiddlers]!is[system]!is[shadow]search:title:literal[${curWord}]!prefix[$:/state]]`),
                from: CodeMirror.Pos(cur.line, pointer),
                to: CodeMirror.Pos(cur.line, end)
            };
        }
    });
});
