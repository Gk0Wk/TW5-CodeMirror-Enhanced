(function (mod) {
  if (typeof exports === 'object' && typeof module === 'object')
    // CommonJS
    module.exports = mod();
  else if (typeof define === 'function' && define.amd)
    // AMD
    define(mod);
  // Plain browser env
  else mod();
})(function () {
  'use strict';

  function getSnippetName(tiddler) {
    let name = tiddler.fields['snippet-name'];
    if (!name) {
      const splits = tiddler.fields.title.split('/');
      name = splits[splits.length - 1];
    }
    return name;
  }

  function hintSnippet(editor, options, cme) {
    const current = editor.getCursor();
    const currentLine = editor.getLine(current.line);
    let pointer = current.ch;
    const end = current.ch;
    const max_length = 30;

    // Match /xxxx
    while (pointer) {
      const ch = currentLine.charAt(pointer - 1);
      if (end - pointer > max_length && !/[\w./\-]/i.test(ch)) {
        return null;
      }
      if (ch !== '/') {
        pointer--;
      } else {
        break;
      }
    }
    if (pointer == 0) return null;
    const currentWord = currentLine.slice(pointer, end);

    const hints = [];
    $tw.utils.each(cme.service.SnippetsList.getSnippetsList(), function (snippets) {
      try {
        $tw.utils.each(snippets, function (value, key) {
          if (key.includes(currentWord))
            hints.push({
              text: value,
              displayText: key,
              hintMatch: cme.service.RealtimeHint.makeLiteralHintMatch(key, currentWord),
            });
        });
      } catch (error) {
        console.error(error);
      }
    });

    // Load tw5 snippet
    $tw.wiki.filterTiddlers('[all[tiddlers+shadows]tag[$:/tags/TextEditor/Snippet]]').forEach(function (snippetTiddler) {
      const snippet = $tw.wiki.getTiddler(snippetTiddler);
      const name = getSnippetName(snippet);
      if (name.includes(currentWord)) {
        hints.push({
          text: {
            snippet: snippet.fields.text,
            preview: '!! ' + snippet.fields.caption + (snippet.fields['snippet-description'] ? '\n\n' + snippet.fields['snippet-description'] : ''),
          },
          displayText: name,
          hintMatch: cme.service.RealtimeHint.makeLiteralHintMatch(name, currentWord),
        });
      }
    });

    // Load KaTeX snippet
    $tw.wiki.filterTiddlers('[all[tiddlers+shadows]tag[$:/tags/KaTeX/Snippet]]').forEach(function (snippetTiddler) {
      const snippet = $tw.wiki.getTiddler(snippetTiddler);
      const name = getSnippetName(snippet);
      if (name.includes(currentWord)) {
        hints.push({
          text: {
            snippet: snippet.fields.text,
            preview: snippet.fields.text,
          },
          displayText: name,
          hintMatch: cme.service.RealtimeHint.makeLiteralHintMatch(name, currentWord),
        });
      }
    });

    return {
      from: cme.CodeMirror.Pos(current.line, pointer - 1),
      to: cme.CodeMirror.Pos(current.line, end),
      renderPreview: function (domNode, selectedData, selectedNode) {
        selectedNode.renderCache = domNode.innerHTML = $tw.wiki.renderText(
          'text/html',
          'text/vnd.tiddlywiki',
          selectedData.text.preview ? selectedData.text.preview : '',
        );
        return true;
      },
      hint: function (editor_, hints_, hint_) {
        // Snippet text replace
        const replaceText = hint_.text.snippet.replaceAll(/(\$\d+)/g, '');
        editor_.replaceRange(replaceText, hint_.from || hints_.from, hint_.to || hints_.to, 'complete');
        // Relocate cursor to placeholder
        const current_ = editor_.getCursor();
        let col = current_.ch;
        let row = current_.line;
        const parts = hint_.text.snippet.split(/(\$\d+)/, 3);
        if (parts[2]) {
          const splits = parts[2].split(/\n/);
          if (splits.length > 1) {
            row -= splits.length - 1;
            col = editor.getLine(row).length - splits[0].length;
          } else {
            col -= parts[2].length;
          }
          editor_.setCursor(row, col);
        }
      },
      type: 'snippet',
      list: hints,
    };
  }

  return {
    hint: hintSnippet,
  };
});
