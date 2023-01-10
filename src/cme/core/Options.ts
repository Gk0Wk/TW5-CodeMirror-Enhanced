function getOption(key: string): string | undefined {
  return $tw.wiki.filterTiddlers(
    `[[$:/plugins/Gk0Wk/TW5-CodeMirror-Enhanced/config.json]getindex[${key}]]`,
  )[0];
}

function getBoolean(key: string, defaultValue: boolean): boolean {
  const optionText: string | undefined = getOption(key);
  return optionText !== undefined
    ? optionText.toLowerCase() === 'true'
    : defaultValue;
}

// function getInteger(key: string, defaultValue: number): number {
//   const optionText: string | undefined = getOption(key);
//   return optionText !== undefined
//     ? ($tw.utils.parseInt(optionText) as number)
//     : defaultValue;
// }

// function getNumber(key: string, defaultValue: number): number {
//   const optionText: string | undefined = getOption(key);
//   return optionText !== undefined
//     ? ($tw.utils.parseNumber(optionText) as number)
//     : defaultValue;
// }

// function getString(key: string, defaultValue: string): string {
//   const optionText: string | undefined = getOption(key);
//   return optionText !== undefined ? optionText : defaultValue;
// }

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class Options {
  static get clickableService(): boolean {
    return getBoolean('clickable-links', false);
  }

  static get realtimeHint(): boolean {
    return getBoolean('realtime-hint', false);
  }

  static get hintPreview(): boolean {
    return getBoolean('hint-preview', false);
  }
}
