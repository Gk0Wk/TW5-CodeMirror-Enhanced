import * as ServiceManager from '../ServiceManager';
import Options from '../../Options';
import * as CodeMirror from 'codemirror';
import 'codemirror/addon/hint/show-hint';

export interface HintAddon {
  hint: (editor: CodeMirror.Editor, options: CodeMirror.ShowHintOptions, cme: Record<string, unknown>) => HintResults | undefined;
}

export interface Range {
  from: number;
  to: number;
}

export interface Hints {
  from: CodeMirror.Position;
  readonly list: Array<Hint | string>;
  to: CodeMirror.Position;
}

export interface Hint {
  className?: string;
  displayText?: string;
  from?: CodeMirror.Position;
  hint?: (editor: CodeMirror.Editor, hints: Hints, hint: Hint) => void;
  hintMatch?: Range[];
  render?: (hintNode: HTMLLIElement, hints: Hints, currentHint: Hint) => void;
  renderCache?: string;
  renderPreview?: (domNode: HTMLDivElement, selectedData: Hint, selectedNode: HTMLLIElement) => boolean;
  render_?: (hintNode: HTMLSpanElement, hints: Hints, currentHint: Hint) => void;
  text: string;
  to?: CodeMirror.Position;
  type?: string;
}

export interface HintResult {
  className?: string;
  displayText?: string;
  from?: CodeMirror.Position;
  hint?: (editor: CodeMirror.Editor, hints: Hints, hint: Hint) => void;
  hintMatch?: Range[];
  render?: (hintNode: HTMLSpanElement, hints: Hints, currentHint: Hint) => void;
  renderCache?: string;
  renderPreview?: (domNode: HTMLDivElement, selectedData: Hint, selectedNode: HTMLLIElement) => boolean;
  text: string;
  to?: CodeMirror.Position;
  type?: string;
}

export interface HintResults {
  className?: string;
  from?: CodeMirror.Position;
  hint?: (editor: CodeMirror.Editor, hints: Hints, hint: Hint) => void;
  hintMatch?: Range[];
  list: Array<HintResult | string>;
  render?: (hintNode: HTMLSpanElement, hints: Hints, currentHint: Hint) => void;
  renderPreview?: (domNode: HTMLDivElement, selectedData: Hint, selectedNode: HTMLLIElement) => boolean;
  to?: CodeMirror.Position;
  type?: string;
}

function globalHintRender(hintNode: HTMLLIElement, hints: Hints, currentHint: Hint): void {
  const ownerDocument: Document = hintNode.ownerDocument;
  // Render (left side) [title]
  const titlePartNode: HTMLSpanElement = ownerDocument.createElement('span');
  hintNode.append(titlePartNode);
  titlePartNode.className = 'hint-title';
  if (currentHint.render_ !== undefined) {
    currentHint.render_(titlePartNode, hints, currentHint);
  } else {
    let text = currentHint.displayText ?? currentHint.text ?? '';
    if (currentHint.hintMatch !== undefined) {
      const textList = [];
      try {
        currentHint.hintMatch.sort(function (a: Range, b: Range): number {
          return a.from - b.from;
        });
        let pointer = 0;
        currentHint.hintMatch.forEach(function (range: Range): void {
          if (range.from > pointer) {
            textList.push(text.substring(pointer, range.from));
          }
          pointer = range.to;
          textList.push(`<span class="hint-title-highlighted">${text.substring(range.from, pointer)}</span>`);
        });
        if (text.length > pointer) textList.push(text.substring(pointer));
        text = textList.join('');
      } catch {
        text = currentHint.displayText ?? currentHint.text ?? '';
      }
    }
    titlePartNode.innerHTML = text;
  }
  // Render (right side) [type]
  const typeString = currentHint.type;
  if (typeString !== undefined) {
    const typePartNode: HTMLSpanElement = ownerDocument.createElement('span');
    hintNode.append(typePartNode);
    typePartNode.className = 'hint-type';
    typePartNode.append(ownerDocument.createTextNode(typeString));
  }
}

export function init(): void {
  ServiceManager.registerService({
    name: 'RealtimeHint',
    tag: '$:/CodeMirrorEnhanced/RealtimeHint',
    onLoad: (cme: Record<string, unknown>): void => {
      CodeMirror.registerHelper('hint', 'tiddlywiki5', async (editor: CodeMirror.Editor, options: CodeMirror.ShowHintOptions) => {
        try {
          const addons = ServiceManager.getAddons('RealtimeHint');
          const getHintAsyncTasks: Array<Promise<Hints | undefined>> = [];
          for (const addonTiddler in addons) {
            const addon = addons[addonTiddler];
            getHintAsyncTasks.push(
              new Promise<Hints | undefined>((resolve) => {
                // TODO: do some check here to make sure it is HintAddon
                const hintAddon = addon as HintAddon;
                try {
                  const hints: HintResults | undefined = hintAddon.hint(editor, options, cme);
                  const tmplist: Hint[] = [];
                  let minPos: CodeMirror.Position = editor.getCursor();
                  if (typeof hints === 'object') {
                    if (hints.from !== undefined && CodeMirror.cmpPos(minPos, hints.from) > 0) minPos = hints.from;
                    hints.list.forEach((hint: HintResult | string) => {
                      if (typeof hint === 'string') {
                        if (hints.from !== undefined && hints.to !== undefined)
                          tmplist.push({
                            text: hint,
                            from: hints.from,
                            to: hints.to,
                            render_: hints.render,
                            render: globalHintRender,
                            renderPreview: hints.renderPreview,
                            hint: hints.hint,
                            type: hints.type,
                            className: 'cm-hacked-hint',
                          });
                      } else {
                        const _from = hint.from === undefined ? hints.from : hint.from;
                        const _to = hint.to === undefined ? hints.to : hint.to;
                        if (_from !== undefined && _to !== undefined)
                          tmplist.push({
                            text: hint.text,
                            displayText: hint.displayText,
                            from: _from,
                            to: _to,
                            render_: hint.render === undefined ? hints.render : hint.render,
                            render: globalHintRender,
                            renderPreview: hint.renderPreview === undefined ? hints.renderPreview : hint.renderPreview,
                            hintMatch: hint.hintMatch === undefined ? hints.hintMatch : hint.hintMatch,
                            hint: hint.hint === undefined ? hints.hint : hint.hint,
                            type: hint.type === undefined ? hints.type : hint.type,
                            renderCache: hint.renderCache,
                            className: 'cm-hacked-hint',
                          });
                        if (hint.from !== undefined && CodeMirror.cmpPos(minPos, hint.from) > 0) minPos = hint.from;
                      }
                    });
                  }
                  resolve({
                    from: minPos,
                    list: tmplist,
                    to: editor.getCursor(),
                  });
                } catch (error) {
                  console.error(`Error occured by tiddler ${addonTiddler}:`);
                  console.error(error);
                  // eslint-disable-next-line unicorn/no-useless-undefined
                  resolve(undefined);
                }
              }),
            );
          }
          const hintsList = await Promise.all(getHintAsyncTasks);
          const result: Hints = {
            from: editor.getCursor(),
            list: [],
            to: editor.getCursor(),
          };
          hintsList.forEach((hints) => {
            if (hints === undefined) return;
            hints.list.forEach((hint) => {
              result.list.push(hint);
            });
            if (CodeMirror.cmpPos(result.from, hints.from) > 0) result.from = hints.from;
          });
          // Check if hint result is empty
          // eslint-disable-next-line unicorn/no-null
          let previewBoxNode: HTMLDivElement | null;
          const closePreview = (): void => {
            if (previewBoxNode?.ownerDocument.body?.contains(previewBoxNode) === true) previewBoxNode?.remove();
          };
          if (result.list.length > 0) {
            // perform action to dom node when a hint is selected
            CodeMirror.on<'select'>(result, 'select', function (selectedData_: string | Hint, selectedNode_: Element): void {
              const selectedData = selectedData_ as unknown as Hint;
              const selectedNode = selectedNode_ as HTMLLIElement;
              if (Options.hintPreview) {
                const parentNode = selectedNode.parentNode as HTMLElement;
                const appendId: string = parentNode.id + '-hint-append';
                previewBoxNode = selectedNode.ownerDocument.querySelector(`#${appendId}`) as HTMLDivElement;
                const shouldCreate = previewBoxNode === null || previewBoxNode === undefined;
                if (shouldCreate) {
                  previewBoxNode = selectedNode.ownerDocument.createElement('div');
                  previewBoxNode.id = appendId;
                  previewBoxNode.className =
                    'CodeMirror-hints CodeMirror-hints-append ' + (editor.getOption('theme') === undefined ? '' : (editor.getOption('theme') as string));
                  previewBoxNode.style.left = `${parentNode.offsetLeft + parentNode.offsetWidth}px`;
                  previewBoxNode.style.top = `${parentNode.offsetTop}px`;
                }
                let shouldDisplay = false;
                try {
                  if (typeof selectedData.renderCache === 'string') {
                    previewBoxNode.innerHTML = selectedData.renderCache;
                    shouldDisplay = true;
                  } else if (typeof selectedData.renderPreview === 'function') {
                    shouldDisplay = selectedData.renderPreview(previewBoxNode, selectedData, selectedNode);
                    if (shouldDisplay && previewBoxNode.innerHTML.trim() === '') shouldDisplay = false;
                  }
                } catch (error) {
                  previewBoxNode.textContent = String(error);
                  console.error(error);
                }
                if (shouldDisplay) {
                  if (shouldCreate) {
                    CodeMirror.on<'close'>(result, 'close', closePreview);
                    CodeMirror.on<'endCompletion'>(editor, 'endCompletion', closePreview);
                    let closingOnBlur: number;
                    editor.on<'blur'>('blur', (): void => {
                      closingOnBlur = setTimeout(closePreview, 100);
                    });
                    editor.on<'focus'>('focus', (): void => clearTimeout(closingOnBlur));
                    selectedNode.ownerDocument.body.append(previewBoxNode);
                  }
                } else if (selectedNode.ownerDocument.body.contains(previewBoxNode)) previewBoxNode?.remove();
              }
            });
          } else {
            // If empty, close previous preview box.
            closePreview();
          }
          return result;
        } catch (error) {
          console.error(error);
          // eslint-disable-next-line unicorn/no-null
          return null;
        }
      });
    },
    onHook: (editor: CodeMirror.Editor, cme: Record<string, unknown>): void => {
      // Hint when text change
      editor.on<'change'>('change', function (cm: CodeMirror.Editor, event: CodeMirror.EditorChange) {
        // Check if hint is open and hint function exists
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-unsafe-member-access
        if (cm.state.completeActive && typeof cm.showHint !== 'function') return;
        // Check if auto hint switch on
        if (!Options.realtimeHint) return;
        // If user type something
        if (event.origin === '+input') {
          if (cm.getDoc().modeOption === 'text/vnd.tiddlywiki') {
            // Check if cursor point to any stop words
            // If writting tw text
            if (/[,;]$/.test(event.text[0])) return;
          } else {
            // If writting other text
            if (/[(),;[\]{}]$/.test(event.text[0])) return;
          }
          // Check if just break the line
          if (event.text[0].trim() === '') {
            if (event.text.length > 1) {
              if (event.text[1].trim() === '') return;
            } else return;
          }
        }
        // If user delete something
        else if (event.origin === '+delete') {
          // If delete nothing or to much thing(2+ lines)
          if (event.removed === undefined || event.removed.length > 2 || event.removed[0] === '') return;
          // If cursor point to the line head
          if (event.to.ch < 2) return;
          // If text of line before the cursor is blank
          const theLine: string = cm.getDoc().getLine(event.to.line);
          if (theLine.length === 0 || theLine.substr(0, event.to.ch - 1).trim() === '') return;
        } else {
          // paste cut undo
          return;
        }
        // If not above, show hint
        cm.showHint({
          // If there is oly one hint suggestion, don't complete automatically, or can be awful.
          completeSingle: false,
          // Close when pick one of hints
          closeOnPick: true,
        });
      });
    },
    api: {
      makeLiteralHintMatch: (text: string, search: string, times?: number): Range[] => {
        const hintMatch: Range[] = [];
        if (times === 0 || text.length === 0 || search.length === 0) return hintMatch;
        let counter = 0;
        let to = 0;
        // eslint-disable-next-line no-unmodified-loop-condition
        while (times === undefined || counter++ < times) {
          const from: number = text.indexOf(search, to);
          if (from < 0) break;
          to = from + search.length;
          hintMatch.push({ from, to });
        }
        return hintMatch;
      },
    },
  });
}
