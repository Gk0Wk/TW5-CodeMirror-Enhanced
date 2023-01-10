import { Editor } from 'codemirror';

export const hint = (editor: Editor, _options: any, cme: any) => {
  const current = editor.getCursor();
  const currentLine = editor.getLine(current.line);
  const end = current.ch;
  const max_length = 30;
  let pointer = current.ch;

  // wikilink match
  // look forward from cursor to [{|"
  // if meet ]}.> or line head, stop
  const escapeChars = ['.', ']', '}', '>'];
  const stopChars = ['[', '{', '|', '"'];
  while (pointer) {
    const ch = currentLine.charAt(pointer - 1);
    if (end - pointer > max_length || escapeChars.includes(ch)) {
      return undefined;
    }
    if (!stopChars.includes(ch)) {
      pointer--;
    } else {
      break;
    }
  }
  if (pointer === 0) {
    return undefined;
  }
  const curWord = pointer !== end && currentLine.slice(pointer, end);

  const tiddlerList: any[] = [];
  const filteredTiddler =
    currentLine.charAt(pointer) === '$'
      ? $tw.wiki.filterTiddlers(
          `[all[tiddlers]search:title:literal[${curWord}]!prefix[$:/state]]`,
        )
      : $tw.wiki.filterTiddlers(
          `[all[tiddlers]!is[system]search:title:literal[${curWord}]!prefix[$:/state]]`,
        );
  $tw.utils.each(filteredTiddler, tiddler => {
    tiddlerList.push({
      text: tiddler,
      hintMatch: cme.service.RealtimeHint.makeLiteralHintMatch(
        tiddler,
        curWord,
      ),
    });
  });

  return {
    from: cme.CodeMirror.Pos(current.line, pointer),
    to: cme.CodeMirror.Pos(current.line, end),
    renderPreview: (
      domNode: HTMLElement,
      selectedData: any,
      selectedNode: any,
    ) => {
      domNode.innerHTML = $tw.wiki.renderTiddler(
        'text/html',
        selectedData.text,
      );
      selectedNode.renderCache = domNode.innerHTML;
      return true;
    },
    type: 'tiddler',
    list: tiddlerList,
  };
};
