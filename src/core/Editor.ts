import CodeMirror from 'codemirror';

let activatedEditor: CodeMirror.Editor | undefined;

function currentEditor(): CodeMirror.Editor | undefined {
  if (activatedEditor === undefined) return undefined;
  const wrapper: HTMLElement = activatedEditor.getWrapperElement();
  if (!wrapper.ownerDocument.contains(wrapper)) activatedEditor = undefined;
  return activatedEditor;
}

function insertToCurrentEditor(text: string): boolean {
  const editor = currentEditor();
  if (editor === undefined) return false;
  editor.replaceRange(text, editor.getCursor(), editor.getCursor(), 'input');
  return true;
}

function getCurrentSelections(): string[] {
  const editor = currentEditor();
  if (editor === undefined) return [];
  return editor.getSelections();
}

function replaceCurrentSelections(textArray: string[]): void {
  const editor = currentEditor();
  if (editor === undefined) return;
  editor.replaceSelections(textArray);
}

export function init(): Record<string, unknown> {
  // When new editor instance is created, update addons and hook service
  CodeMirror.defineInitHook(function (editor: CodeMirror.Editor): void {
    editor.on<'focus'>('focus', function (editor_: CodeMirror.Editor): void {
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
