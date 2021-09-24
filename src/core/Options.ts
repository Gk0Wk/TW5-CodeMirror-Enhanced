declare var $tw: any;

function getBoolean(tiddler: string, defaultValue: boolean): boolean {
  let tiddlerText = $tw.wiki.getTiddlerText(tiddler);
  return tiddlerText ? tiddlerText.toLowerCase() === "true" : defaultValue;
}

function getInteger(tiddler: string, defaultValue: Number): Number {
  let tiddlerText = $tw.wiki.getTiddlerText(tiddler);
  return tiddlerText ? $tw.utils.parseInt(tiddlerText) : defaultValue;
}

function getNumber(tiddler: string, defaultValue: Number): Number {
  let tiddlerText = $tw.wiki.getTiddlerText(tiddler);
  return tiddlerText
    ? $tw.utils.parseNumber($tw.wiki.getTiddlerText(tiddler))
    : defaultValue;
}

function getStrings(tiddler: string): Array<string> {
  let tiddlerText = $tw.wiki.getTiddlerText(tiddler);
  return tiddlerText
    ? $tw.utils.parseStringArray($tw.wiki.getTiddlerText(tiddler))
    : [];
}

export default class Options {
  static get clickableService() {
    return getBoolean(
      "$:/plugins/Gk0Wk/TW5-CodeMirror-Enhanced/config/clickable-link",
      false
    );
  }
  static get realtimeHint() {
    return getBoolean(
      "$:/plugins/Gk0Wk/TW5-CodeMirror-Enhanced/config/realtime-hint",
      false
    );
  }
  static get hintPreview() {
    return getBoolean(
      "$:/plugins/Gk0Wk/TW5-CodeMirror-Enhanced/config/hint-preview",
      false
    );
  }
}
