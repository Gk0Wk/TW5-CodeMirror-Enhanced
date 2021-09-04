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

    var renderAppend = function(domNode, selectedText, selectedNode) {
        domNode.innerHTML = $tw.wiki.renderTiddler("text/html", selectedText);
    };

    var hintOptions = {
        // 如果补全建议中只有一个，不会自动补全，否则体验会非常糟糕
        completeSingle: false,
        closeOnPick: true
    };
    // 有新的editor实例创建，就Hook一下，达到实时提示的效果
    CodeMirror.defineInitHook(function(editor) {
        // 当光标移动(输入、删除、光标移动)时进行补全
        editor.on("change", function(cm, event) {
            if (cm.state.completeActive && typeof cm.showHint !== 'function')
                return;
            if ($tw.wiki.getTiddlerText('$:/plugins/Gk0Wk/codemirror-mode-tiddlywiki5/config/realtime-hint').toLowerCase() !== "true")
                return;
            if (event.origin === "+input") {
                if (cm.doc.modeOption === "text/vnd.tiddlywiki") {
                    if (/[;,]$/.test(event.text[0]))
                        return;
                } else {
                    if (/[;,{}()[\]]$/.test(event.text[0]))
                        return;
                }
                if (event.text[0].trim() === "") {
                    if (event.text[1]) {
                        if (event.text[1].trim() === "")
                            return;
                    } else
                        return;
                }
            }
            if (event.origin === "+delete") {
                if (event.removed[0] === "")
                    return;
                if (event.to.ch < 2)
                    return;
                if (cm.getDoc().getLine(event.to.line).substr(0, event.to.ch - 1).trim() === "")
                    return;
            }
            cm.showHint(hintOptions);
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

        // Hool to event
        var result = {
            from: CodeMirror.Pos(cur.line, pointer),
            to: CodeMirror.Pos(cur.line, end)
        };
        result.list = (curLine.charAt(pointer) == '$') ?
            $tw.wiki.filterTiddlers(`[all[tiddlers]search:title:literal[${curWord}]!prefix[$:/state]]`) :
            $tw.wiki.filterTiddlers(`[all[tiddlers]!is[system]!is[shadow]search:title:literal[${curWord}]!prefix[$:/state]]`);

        if ($tw.wiki.getTiddlerText('$:/plugins/Gk0Wk/codemirror-mode-tiddlywiki5/config/hint-preview').toLowerCase() === "true") {
            CodeMirror.on(result, 'select', function(text, domNode) {
                var appendId = domNode.parentNode.id + "-hint-append";
                var hintsAppend = domNode.ownerDocument.getElementById(appendId);
                var shouldCreate = !hintsAppend;
                if (shouldCreate) {
                    hintsAppend = domNode.ownerDocument.createElement("div");
                    hintsAppend.id = appendId;
                    hintsAppend.className = "CodeMirror-hints CodeMirror-hints-append " + editor.options.theme;
                    hintsAppend.style.left = domNode.parentNode.offsetLeft + domNode.parentNode.offsetWidth + "px";
                    hintsAppend.style.top = domNode.parentNode.offsetTop + "px";
                }
                renderAppend(hintsAppend, text, domNode);
                if (shouldCreate) {
                    CodeMirror.on(result, 'close', function() {
                        domNode.ownerDocument.body.removeChild(hintsAppend);
                    });
                    domNode.ownerDocument.body.appendChild(hintsAppend);
                }
            });
        }

        return result;
    });
});
