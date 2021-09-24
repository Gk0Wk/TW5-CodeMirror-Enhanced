declare var $tw: any;

function getBoolean(tiddler: string): boolean {
  return $tw.wiki.getTiddlerText(tiddler).toLowerCase() === "true";
}

function getInteger(tiddler: string): Number {
  return $tw.utils.parseInt($tw.wiki.getTiddlerText(tiddler));
}

function getNumber(tiddler: string): Number {
  return $tw.utils.parseNumber($tw.wiki.getTiddlerText(tiddler));
}

function getStrings(tiddler: string): Array<string> {
  return $tw.utils.parseStringArray($tw.wiki.getTiddlerText(tiddler));
}

export default class Options {
  static get clickableService() {
    return getBoolean(
      "$:/plugins/Gk0Wk/codemirror-mode-tiddlywiki5/config/clickable-link"
    );
  }
  static get realtimeHint() {
    return getBoolean(
      "$:/plugins/Gk0Wk/codemirror-mode-tiddlywiki5/config/realtime-hint"
    );
  }
  static get hintPreview() {
    return getBoolean(
      "$:/plugins/Gk0Wk/codemirror-mode-tiddlywiki5/config/hint-preview"
    );
  }
}
