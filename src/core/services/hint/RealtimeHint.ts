import * as ServiceManager from '../ServiceManager';
import Options from '../../Options';
declare let $tw: any;

export interface HintAddon {
  hint: (editor: any, options: any, cme: any) => HintResults;
}

export interface Range {
  from: number;
  to: number;
}

export class Hints {
  constructor(public readonly list: Hint[], public from: any) {}
}

export interface Hint {
  className: string;
  displayText?: string;
  from: any;
  hint?: (editor: any, hints: Hints, hint: Hint) => void;
  hintMatch?: Range[];
  render: (hintNode: HTMLLIElement, hints: Hints, currentHint: Hint) => void;
  renderCache?: string;
  renderPreview?: (domNode: HTMLDivElement, selectedData: Hint, selectedNode: HTMLLIElement) => boolean;
  render_?: (hintNode: HTMLSpanElement, hints: Hints, currentHint: Hint) => void;
  text: string;
  to: any;
  type?: string;
}

export interface HintResult {
  className?: string;
  displayText?: string;
  from?: any;
  hint?: (editor: any, hints: Hints, hint: Hint) => void;
  hintMatch?: Range[];
  render?: (hintNode: HTMLSpanElement, hints: Hints, currentHint: Hint) => void;
  renderCache?: string;
  renderPreview?: (domNode: HTMLDivElement, selectedData: Hint, selectedNode: HTMLLIElement) => boolean;
  text: string;
  to?: any;
  type?: string;
}

export interface HintResults {
  className?: string;
  from?: any;
  hint?: (editor: any, hints: Hints, hint: Hint) => void;
  hintMatch?: Range[];
  list: Array<HintResult | string>;
  render?: (hintNode: HTMLSpanElement, hints: Hints, currentHint: Hint) => void;
  renderPreview?: (domNode: HTMLDivElement, selectedData: Hint, selectedNode: HTMLLIElement) => boolean;
  to?: any;
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
    onLoad: (codeMirror, cme): void => {
      codeMirror.registerHelper('hint', 'tiddlywiki5', async function (editor: any, options: any) {
        return await new Promise<Hints | null>((resolve, reject) => {
          try {
            const promises: Array<Promise<Hints | null>> = [];
            $tw.utils.each(ServiceManager.getAddons('RealtimeHint'), function (addon: HintAddon, addonTiddler: string) {
              promises.push(
                new Promise<Hints | null>((resolve_, reject_) => {
                  try {
                    const hints: HintResults = addon.hint(editor, options, cme);
                    const tmplist: Hint[] = [];
                    let minPos: any = editor.getCursor();
                    if (hints && typeof hints === 'object') {
                      if (hints.from && codeMirror.cmpPos(minPos, hints.from) > 0) minPos = hints.from;
                      hints.list.forEach((hint: HintResult | string) => {
                        if (typeof hint === 'string') {
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
                          tmplist.push({
                            text: hint.text,
                            displayText: hint.displayText,
                            from: hint.from || hints.from,
                            to: hint.to || hints.to,
                            render_: hint.render !== undefined || hints.render,
                            render: globalHintRender,
                            renderPreview: hint.renderPreview !== undefined || hints.renderPreview,
                            hintMatch: hint.hintMatch !== undefined || hints.hintMatch,
                            hint: hint.hint !== undefined || hints.hint,
                            type: hint.type || hints.type,
                            renderCache: hint.renderCache,
                            className: 'cm-hacked-hint',
                          });
                          if (hint.from && codeMirror.cmpPos(minPos, hint.from) > 0) minPos = hint.from;
                        }
                      });
                    }
                    resolve_(new Hints(tmplist, minPos));
                  } catch (error) {
                    console.error(`Error occured by tiddler ${addonTiddler}:`);
                    console.error(error);
                    resolve_(null);
                  }
                }),
              );
            });
            Promise.all(promises).then((hintsList) => {
              const result: Hints = new Hints([], editor.getCursor());
              hintsList.forEach((hints) => {
                if (hints == undefined) return;
                hints.list.forEach((hint) => {
                  result.list.push(hint);
                });
                if (codeMirror.cmpPos(result.from, hints.from) > 0) result.from = hints.from;
              });
              codeMirror.on(result, 'select', function (selectedData: Hint, selectedNode: HTMLLIElement): void {
                if (Options.hintPreview) {
                  const appendId: string = (selectedNode.parentNode as HTMLElement).id + '-hint-append';
                  let previewBoxNode: HTMLDivElement = selectedNode.ownerDocument.getElementById(appendId) as HTMLDivElement;
                  const shouldCreate = !previewBoxNode;
                  if (shouldCreate) {
                    previewBoxNode = selectedNode.ownerDocument.createElement('div');
                    previewBoxNode.id = appendId;
                    previewBoxNode.className = 'CodeMirror-hints CodeMirror-hints-append ' + editor.options.theme;
                    previewBoxNode.style.left =
                      (selectedNode.parentNode as HTMLElement).offsetLeft + (selectedNode.parentNode as HTMLElement).offsetWidth + 'px';
                    previewBoxNode.style.top = (selectedNode.parentNode as HTMLElement).offsetTop + 'px';
                  }
                  let shouldDisplay: boolean;
                  try {
                    if (selectedData.renderCache && typeof selectedData.renderCache === 'string') {
                      previewBoxNode.innerHTML = selectedData.renderCache;
                      shouldDisplay = true;
                    } else if (selectedData.renderPreview !== undefined && typeof selectedData.renderPreview === 'function') {
                      shouldDisplay = selectedData.renderPreview(previewBoxNode, selectedData, selectedNode);
                      if (shouldDisplay && previewBoxNode.innerHTML.trim() === '') shouldDisplay = false;
                    } else {
                      shouldDisplay = false;
                    }
                  } catch (error) {
                    previewBoxNode.innerText = String(error);
                    console.error(error);
                  }
                  if (shouldDisplay) {
                    if (shouldCreate) {
                      codeMirror.on(result, 'close', function (): void {
                        if (selectedNode.ownerDocument.body.contains(previewBoxNode)) previewBoxNode.remove();
                      });
                      selectedNode.ownerDocument.body.append(previewBoxNode);
                    }
                  } else if (selectedNode.ownerDocument.body.contains(previewBoxNode)) previewBoxNode.remove();
                }
              });
              resolve(result);
            });
          } catch (error) {
            console.error(error);
            resolve(null);
          }
        });
      });
    },
    onHook: function (editor: any, cme: object): void {
      // Hint when text change
      editor.on('change', function (cm: any, event: any) {
        // Check if hint is open and hint function exists
        if (cm.state.completeActive && typeof cm.showHint !== 'function') return;
        // Check if auto hint switch on
        if (!Options.realtimeHint) return;
        // If user type something
        if (event.origin === '+input') {
          // Check if cursor point to any stop words
          if (cm.doc.modeOption === 'text/vnd.tiddlywiki') {
            // If writting tw text
            if (/[,;]$/.test(event.text[0])) return;
          } else {
            // If writting other text
            if (/[(),;[\]{}]$/.test(event.text[0])) return;
          }
          // Check if just break the line
          if (event.text[0].trim() === '') {
            if (event.text[1]) {
              if (event.text[1].trim() === '') return;
            } else return;
          }
        }
        // If user delete something
        else if (event.origin === '+delete') {
          // If delete nothing
          if (event.removed[0] === '') return;
          // If cursor point to the line head
          if (event.to.ch < 2) return;
          // If text of line before the cursor is blank
          const theLine: string = cm.getDoc().getLine(event.to.line);
          if (!theLine || theLine.substr(0, event.to.ch - 1).trim() === '') return;
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
      makeLiteralHintMatch: function (text: string, search: string, times?: number): Range[] {
        const hintMatch: Range[] = [];
        if (times === 0 || !text || !search) return hintMatch;
        let counter = 0;
        let to = 0;
        while (!times || counter++ < times) {
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
