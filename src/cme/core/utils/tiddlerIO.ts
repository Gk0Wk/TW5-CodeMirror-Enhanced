export const loadTiddler = (
  tiddler: string,
): Record<string, unknown> | undefined => {
  try {
    const { fields } = $tw.wiki.getTiddler(tiddler)!;
    switch (fields.type) {
      case 'application/javascript': {
        return require(tiddler);
      }
      case 'application/json': {
        return JSON.parse(fields.text);
      }
      case 'application/x-tiddler-dictionary': {
        return $tw.utils.parseFields(fields.text);
      }
      default: {
        break;
      }
    }
  } catch (error) {
    console.error(error);
  }
  return undefined;
};

export const setTiddlerText = (tiddler: string, text: string) =>
  $tw.wiki.setText(tiddler, 'text', undefined, text);
