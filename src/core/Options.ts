declare var $tw: any;

function getOption(key: string): string | undefined {
  return $tw.wiki.filterTiddlers(
    `[[$:/plugins/Gk0Wk/TW5-CodeMirror-Enhanced/config.json]getindex[${key}]]`
  )[0];
}

function getBoolean(key: string, defaultValue: boolean): boolean {
  let optionText: string | undefined = getOption(key);
  return optionText ? optionText.toLowerCase() === "true" : defaultValue;
}

function getInteger(key: string, defaultValue: Number): Number {
  let optionText: string | undefined = getOption(key);
  return optionText ? $tw.utils.parseInt(optionText) : defaultValue;
}

function getNumber(key: string, defaultValue: Number): Number {
  let optionText: string | undefined = getOption(key);
  return optionText ? $tw.utils.parseNumber(getOption(key)) : defaultValue;
}

function getString(key: string, defaultValue: string): string {
  let optionText: string | undefined = getOption(key);
  return optionText ? optionText : defaultValue;
}

export default class Options {
  static get clickableService() {
    return getBoolean("clickable-link", false);
  }
  static get realtimeHint() {
    return getBoolean("realtime-hint", false);
  }
  static get hintPreview() {
    return getBoolean("hint-preview", false);
  }
}
