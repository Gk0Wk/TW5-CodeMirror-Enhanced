declare var $tw: any;
import * as ServiceManager from "../ServiceManager";
import Options from "../../Options";

export interface HintAddon {
  hint: (editor: any, options: any) => HintResults;
}

export class Hints {
  constructor(public readonly list: Array<Hint>, public from: any) {}
}

export interface Hint {
  text: string;
  displayText?: string;
  from: any;
  to: any;
  render_?: (hintNode: HTMLSpanElement, hints: Hints, curHint: Hint) => void;
  render: (hintNode: HTMLLIElement, hints: Hints, curHint: Hint) => void;
  renderPreview?: (
    domNode: HTMLDivElement,
    selectedText: Hint,
    selectedNode: HTMLLIElement
  ) => boolean;
  hint?: (editor: any, hints: Hints, hint: Hint) => void;
  type?: string;
  renderCache?: string;
  className: string;
}

export interface HintResult {
  text: string;
  displayText?: string;
  from?: any;
  to?: any;
  type?: string;
  className?: string;
  renderPreview?: (
    domNode: HTMLDivElement,
    selectedText: Hint,
    selectedNode: HTMLLIElement
  ) => boolean;
  hint?: (editor: any, hints: Hints, hint: Hint) => void;
  render?: (hintNode: HTMLSpanElement, hints: Hints, curHint: Hint) => void;
  renderCache?: string;
}

export interface HintResults {
  list: Array<HintResult | string>;
  from?: any;
  to?: any;
  className?: string;
  type?: string;
  renderPreview?: (
    domNode: HTMLDivElement,
    selectedText: Hint,
    selectedNode: HTMLLIElement
  ) => boolean;
  hint?: (editor: any, hints: Hints, hint: Hint) => void;
  render?: (hintNode: HTMLSpanElement, hints: Hints, curHint: Hint) => void;
}

function globalHintRender(
  hintNode: HTMLLIElement,
  hints: Hints,
  curHint: Hint
) {
  let ownerDocument: Document = hintNode.ownerDocument;
  // Render (left side) [title]
  let titlePartNode: HTMLSpanElement = hintNode.appendChild(
    ownerDocument.createElement("span")
  );
  if (curHint.render_) {
    curHint.render_(titlePartNode, hints, curHint);
  } else {
    titlePartNode.appendChild(
      ownerDocument.createTextNode(curHint.displayText || curHint.text || "")
    );
  }
  // Render (right side) [type]
  let typeString = curHint.type || null;
  if (typeString) {
    let typePartNode: HTMLSpanElement = hintNode.appendChild(
      ownerDocument.createElement("span")
    );
    typePartNode.appendChild(ownerDocument.createTextNode(typeString));
  }
}

export function init(): void {
  ServiceManager.registerService({
    name: "RealtimeHint",
    tag: "$:/CodeMirrorEnhanced/RealtimeHint",
    onLoad: function (CodeMirror: any): void {
      CodeMirror.registerHelper(
        "hint",
        "tiddlywiki5",
        function (editor: any, options: any) {
          return new Promise<Hints | null>((resolve, reject) => {
            try {
              let promises: Array<Promise<Hints | null>> = [];
              $tw.utils.each(
                ServiceManager.getAddons("RealtimeHint"),
                function (addon: HintAddon, addonTiddler: string) {
                  promises.push(
                    new Promise<Hints | null>((resolve_, reject_) => {
                      try {
                        let hints: HintResults = addon.hint(editor, options);
                        let tmplist: Array<Hint> = [];
                        let minPos: any = editor.getCursor();
                        if (hints && typeof hints === "object") {
                          if (
                            hints.from &&
                            CodeMirror.cmpPos(minPos, hints.from) > 0
                          )
                            minPos = hints.from;
                          hints.list.forEach((hint: HintResult | string) => {
                            if (typeof hint === "string") {
                              tmplist.push({
                                text: hint,
                                from: hints.from,
                                to: hints.to,
                                render_: hints.render,
                                render: globalHintRender,
                                renderPreview: hints.renderPreview,
                                hint: hints.hint,
                                type: hints.type,
                                className: "cm-hacked-hint",
                              });
                            } else {
                              tmplist.push({
                                text: hint.text,
                                displayText: hint.displayText,
                                from: hint.from || hints.from,
                                to: hint.to || hints.to,
                                render_: hint.render || hints.render,
                                render: globalHintRender,
                                renderPreview:
                                  hint.renderPreview || hints.renderPreview,
                                hint: hint.hint || hints.hint,
                                type: hint.type || hints.type,
                                renderCache: hint.renderCache,
                                className: "cm-hacked-hint",
                              });
                              if (
                                hint.from &&
                                CodeMirror.cmpPos(minPos, hint.from) > 0
                              )
                                minPos = hint.from;
                            }
                          });
                        }
                        resolve_(new Hints(tmplist, minPos));
                      } catch (e) {
                        console.error(
                          `Error occured by tiddler ${addonTiddler}:`
                        );
                        console.error(e);
                        resolve_(null);
                      }
                    })
                  );
                }
              );
              Promise.all(promises).then((hintsList) => {
                let result: Hints = new Hints([], editor.getCursor());
                hintsList.forEach((hints) => {
                  if (!hints) return;
                  hints.list.forEach((hint) => {
                    result.list.push(hint);
                  });
                  if (CodeMirror.cmpPos(result.from, hints.from) > 0)
                    result.from = hints.from;
                });
                CodeMirror.on(
                  result,
                  "select",
                  function (
                    selectedData: Hint,
                    selectedNode: HTMLLIElement
                  ): void {
                    if (Options.hintPreview) {
                      let appendId: string =
                        (selectedNode.parentNode as HTMLElement).id +
                        "-hint-append";
                      let previewBoxNode: HTMLDivElement =
                        selectedNode.ownerDocument.getElementById(
                          appendId
                        ) as HTMLDivElement;
                      let shouldCreate: boolean = !previewBoxNode;
                      if (shouldCreate) {
                        previewBoxNode =
                          selectedNode.ownerDocument.createElement("div");
                        previewBoxNode.id = appendId;
                        previewBoxNode.className =
                          "CodeMirror-hints CodeMirror-hints-append " +
                          editor.options.theme;
                        previewBoxNode.style.left =
                          (selectedNode.parentNode as HTMLElement).offsetLeft +
                          (selectedNode.parentNode as HTMLElement).offsetWidth +
                          "px";
                        previewBoxNode.style.top =
                          (selectedNode.parentNode as HTMLElement).offsetTop +
                          "px";
                      }
                      let shouldDisplay: boolean;
                      try {
                        if (
                          selectedData.renderCache &&
                          typeof selectedData.renderCache === "string"
                        ) {
                          previewBoxNode.innerHTML = selectedData.renderCache;
                          shouldDisplay = true;
                        } else if (
                          selectedData.renderPreview &&
                          typeof selectedData.renderPreview === "function"
                        ) {
                          shouldDisplay =
                            selectedData.renderPreview(
                              previewBoxNode,
                              selectedData,
                              selectedNode
                            ) === true;
                          if (
                            shouldDisplay &&
                            previewBoxNode.innerHTML.trim() === ""
                          )
                            shouldDisplay = false;
                        } else {
                          shouldDisplay = false;
                        }
                      } catch (e) {
                        previewBoxNode.innerText = String(e);
                        console.error(e);
                      }
                      if (shouldDisplay) {
                        if (shouldCreate) {
                          CodeMirror.on(result, "close", function (): void {
                            if (
                              selectedNode.ownerDocument.body.contains(
                                previewBoxNode
                              )
                            )
                              selectedNode.ownerDocument.body.removeChild(
                                previewBoxNode
                              );
                          });
                          selectedNode.ownerDocument.body.appendChild(
                            previewBoxNode
                          );
                        }
                      } else if (
                        selectedNode.ownerDocument.body.contains(previewBoxNode)
                      )
                        selectedNode.ownerDocument.body.removeChild(
                          previewBoxNode
                        );
                    }
                  }
                );
                resolve(result);
              });
            } catch (e) {
              console.error(e);
              resolve(null);
            }
          });
        }
      );
    },
    onHook: function (editor: any, name: string): void {
      // Hint when text change
      editor.on("change", function (cm: any, event: any) {
        // Check if hint is open and hint function exists
        if (cm.state.completeActive && typeof cm.showHint !== "function")
          return;
        // Check if auto hint switch on
        if (!Options.realtimeHint) return;
        // If user type something
        if (event.origin === "+input") {
          // Check if cursor point to any stop words
          if (cm.doc.modeOption === "text/vnd.tiddlywiki") {
            // If writting tw text
            if (/[;,]$/.test(event.text[0])) return;
          } else {
            // If writting other text
            if (/[;,{}()[\]]$/.test(event.text[0])) return;
          }
          // Check if just break the line
          if (event.text[0].trim() === "") {
            if (event.text[1]) {
              if (event.text[1].trim() === "") return;
            } else return;
          }
        }
        // If user delete something
        else if (event.origin === "+delete") {
          // If delete nothing
          if (event.removed[0] === "") return;
          // If cursor point to the line head
          if (event.to.ch < 2) return;
          // If text of line before the cursor is blank
          let theLine: string = cm.getDoc().getLine(event.to.line);
          if (!theLine || theLine.substr(0, event.to.ch - 1).trim() === "")
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
  });
}
