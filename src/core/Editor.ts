declare var $tw: any;

var activatedEditor: any = null;

function currentEditor(): any {
  if (
    !activatedEditor.display.wrapper.ownerDocument.contains(
      activatedEditor.display.wrapper
    )
  )
    activatedEditor = null;
  return activatedEditor;
}

function insertToCurrentEditor(text: string): boolean {
  let editor = currentEditor();
  if (!editor) return false;
  editor.replaceRange(text, editor.getCursor(), editor.getCursor(), "input");
  return true;
}

function getCurrentSelections(): Array<string> {
  let editor = currentEditor();
  if (!editor) return [];
  return editor.getSelections();
}

function replaceCurrentSelections(textArray: Array<string>): void {
  let editor = currentEditor();
  if (!editor) return;
  editor.replaceSelections(textArray);
}

export function init(CodeMirror: any): object {
  // When new editor instance is created, update addons and hook service
  CodeMirror.defineInitHook(function (editor: any): void {
    editor.on("focus", function (editor_: any): void {
      activatedEditor = editor_;
    });
  });

  return {
    currentEditor,
    insertToCurrentEditor,
    getCurrentSelections,
    replaceCurrentSelections,
  };
}
