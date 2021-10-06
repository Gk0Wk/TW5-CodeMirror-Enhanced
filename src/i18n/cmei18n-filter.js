(function() {
    "use strict";

    function loadTiddler(tiddler, tw) {
        switch (tw.wiki.filterTiddlers('[[' + tiddler + ']get[type]]')[0]) {
            case "application/javascript":
                return require(tiddler);
            case "application/json":
                return JSON.parse(tw.wiki.filterTiddlers('[[' + tiddler + ']get[text]]')[0]);
            case "application/x-tiddler-dictionary":
                return tw.utils.parseFields(tw.wiki.filterTiddlers('[[' + tiddler + ']get[text]]')[0]);
            default:
                return {};
        }
    }

    var cache = {};

    exports.cmei18n = function(source, operator, options) {
        // Get language
        var language = options.wiki.filterTiddlers('[[$:/plugins/Gk0Wk/TW5-CodeMirror-Enhanced/config.json]getindex[language]]')[0];
        if (!language || language === 'system') {
            language = options.wiki.getTiddlerText('$:/language').substring(13);
        }

        // ParseMessage
        var messages = operator.operand.split(':', 2);
        var message = messages.length > 1 ? messages[1] : messages[0];
        var namespace = messages.length > 1 ? messages[0] : "core";

        // Fetch languages
        var exactLanguage = language;
        var majorLanguage = language.split('-')[0];
        var languageList = [undefined, undefined, undefined];
        options.wiki.filterTiddlers('[all[tiddlers+shadows]!field:cmei18n[]!is[draft]cmei18n-namespace[' + namespace + ']]').
        forEach(function(tiddler) {
            var i18n = options.wiki.filterTiddlers('[[' + tiddler + ']get[cmei18n]]')[0];
            if (i18n.indexOf(exactLanguage) >= 0)
                languageList[0] = tiddler;
            if (i18n.indexOf(majorLanguage) >= 0)
                languageList[1] = tiddler;
            if (i18n.indexOf("default") >= 0)
                languageList[2] = tiddler;
        });

        for (var i in languageList) {
            if (!languageList[i]) continue;
            var node = loadTiddler(languageList[i], options);
            var subpaths = message.split('.');
            for (var j in subpaths) {
                node = node[subpaths[j]];
                if (!node) break;
            }
            if (typeof node === 'string') {
                cache[message] = node;
                message = node;
                break;
            } else if (node instanceof Array) {
                message = node.join('\n');
                break;
            } else if (cache[message]) {
                message = cache[message];
                break;
            }
        }
        return [message];
    };

})();
