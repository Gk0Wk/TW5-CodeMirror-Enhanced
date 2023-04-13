import { Tiddler } from 'tiddlywiki';
import { Editor, Hint, Hints } from 'codemirror';

const getSnippetName = (tiddler: Tiddler) => {
  let name = tiddler.fields['snippet-name'] as string;
  if (!name) {
    const splits = tiddler.fields.title.split('/');
    name = splits[splits.length - 1];
  }
  return name;
};

export const hint = (editor: Editor, _options: any, cme: any) => {
  const current = editor.getCursor();
  const currentLine = editor.getLine(current.line);
  let pointer = current.ch;
  const end = current.ch;
  const max_length = 30;

  // Match /xxxx
  while (pointer) {
    const ch = currentLine.charAt(pointer - 1);
    if (end - pointer > max_length && !/[\w./-]/i.test(ch)) {
      return undefined;
    }
    // 一直向前移动指针，寻找是否有 / 或者 、
    if (ch !== '/' && ch !== '、') {
      pointer--;
    } else {
      break;
    }
  }
  if (pointer === 0) {
    return undefined;
  }
  const currentWord = currentLine.slice(pointer, end);

  const hints: any[] = [];
  // const snippetsList = cme.service.SnippetsList.getSnippetsList();
  $tw.utils.each(cme.service.SnippetsList.getSnippetsList(), snippets => {
    $tw.utils.each(snippets, snippet_ => {
      try {
        let snippet = snippet_;
        if (snippet.id.includes(currentWord)) {
          if (snippet.i18n) {
            snippet = {
              ...snippet,
              ...{
                name: $tw.wiki.filterTiddlers(`[cmei18n[${snippet.name}]]`)[0],
                preview: $tw.wiki.filterTiddlers(
                  `[cmei18n[${snippet.preview}]]`,
                )[0],
              },
            };
          }
          const displayText = `${snippet.name}  /${snippet.id}`;
          hints.push({
            /** pass full snippet object to hint service */
            text: snippet,
            displayText,
            hintMatch: cme.service.RealtimeHint.makeLiteralHintMatch(
              displayText,
              currentWord,
            ),
          });
        }
      } catch (error) {
        console.error(error);
      }
    });
  });

  // Load tw5 snippet
  $tw.utils.each(
    $tw.wiki.filterTiddlers(
      '[all[tiddlers+shadows]tag[$:/tags/TextEditor/Snippet]]',
    ),
    snippetTiddler => {
      const snippet = $tw.wiki.getTiddler(snippetTiddler);
      if (!snippet) {
        return;
      }
      const name = getSnippetName(snippet);
      if (name.includes(currentWord)) {
        hints.push({
          text: {
            snippet: snippet.fields.text,
            preview: `!! ${snippet.fields.caption}${
              snippet.fields['snippet-description']
                ? `\n\n${snippet.fields['snippet-description']}`
                : ''
            }`,
          },
          displayText: name,
          hintMatch: cme.service.RealtimeHint.makeLiteralHintMatch(
            name,
            currentWord,
          ),
        });
      }
    },
  );

  // Load KaTeX snippet
  $tw.utils.each(
    $tw.wiki.filterTiddlers(
      '[all[tiddlers+shadows]tag[$:/tags/KaTeX/Snippet]]',
    ),
    snippetTiddler => {
      const snippet = $tw.wiki.getTiddler(snippetTiddler);
      if (!snippet) {
        return;
      }
      const name = getSnippetName(snippet);
      if (name.includes(currentWord)) {
        hints.push({
          text: {
            snippet: snippet.fields.text,
            preview: snippet.fields.text,
          },
          displayText: name,
          hintMatch: cme.service.RealtimeHint.makeLiteralHintMatch(
            name,
            currentWord,
          ),
        });
      }
    },
  );

  return {
    from: cme.CodeMirror.Pos(current.line, pointer - 1),
    to: cme.CodeMirror.Pos(current.line, end),
    renderPreview: (
      domNode: HTMLElement,
      selectedData: any,
      selectedNode: any,
    ) => {
      domNode.innerHTML = $tw.wiki.renderText(
        'text/html',
        'text/vnd.tiddlywiki',
        selectedData.text.preview
          ? selectedData.text.preview.replaceAll(/(\$\d+)/g, '')
          : '',
      );
      selectedNode.renderCache = domNode.innerHTML;
      return true;
    },
    hint: (editor_: Editor, hints_: Hints, hint_: Hint) => {
      // Snippet text replace
      const replaceText = (hint_.text as any).snippet.replaceAll(
        /(\$\d+)/g,
        '',
      );
      editor_.replaceRange(
        replaceText,
        hint_.from || hints_.from,
        hint_.to || hints_.to,
        'complete',
      );
      // Relocate cursor to placeholder
      const current_ = editor_.getCursor();
      let col = current_.ch;
      let row = current_.line;
      const parts = (hint_.text as any).snippet.split(/(\$\d+)/, 3);
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
};
