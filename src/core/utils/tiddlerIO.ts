declare let $tw: unknown;
declare function require(path: string): unknown;

export function loadTiddler(tiddler: string): unknown {
  try {
    switch ($tw.wiki.getTiddler(tiddler).fields.type) {
      case 'application/javascript':
        // eslint-disable-next-line security-node/detect-non-literal-require-calls, security/detect-non-literal-require
        return require(tiddler);
      case 'application/json':
        return JSON.parse($tw.wiki.getTiddlerText(tiddler));
      case 'application/x-tiddler-dictionary':
        return $tw.utils.parseFields($tw.wiki.getTiddlerText(tiddler));
      default:
        return undefined;
    }
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

export function setTiddlerText(tiddler: string, text: string): void {
  $tw.wiki.setText(tiddler, 'text', undefined, text);
}
