declare var $tw: any;
declare function require(path: string): any;

export function loadTiddler(tiddler: string): object | null {
  try {
    switch ($tw.wiki.getTiddler(tiddler).fields.type) {
      case "application/javascript":
        return require(tiddler);
      case "application/json":
        return JSON.parse($tw.wiki.getTiddlerText(tiddler));
      case "application/x-tiddler-dictionary":
        return $tw.utils.parseFields($tw.wiki.getTiddlerText(tiddler));
      default:
        return null;
    }
  } catch (e) {
    console.error(e);
    return null;
  }
}

export function setTiddlerText(tiddler: string, text: string): void {
  $tw.wiki.setText(tiddler, "text", undefined, text, undefined);
}
