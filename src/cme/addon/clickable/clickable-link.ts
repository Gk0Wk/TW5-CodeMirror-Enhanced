/* Enhance from and specially thank to https://github.com/adithya-badidey/TW5-codemirror-plus */
export const handler = (_editor: any, event: MouseEvent) => {
  // DEBUG: console (event.target as HTMLElement)?.innerText
  console.log(`(event.target as HTMLElement)?.innerText`, (event.target as HTMLElement)?.innerText);
  const targetName = trimVisualName((event.target as HTMLElement)?.innerText);
  if (!targetName) {
    return false;
  }
  if ((event.target as HTMLElement).classList.contains('cm-externallink')) {
    window.open(targetName);
    return true;
  } else if (
    (event.target as HTMLElement).classList.contains('cm-internallink')
  ) {
    new $tw.Story({}).navigateTiddler(targetName);
    return true;
  } else {
    return false;
  }
};

function trimVisualName(linkWithVisualName?: string): string {
  if (linkWithVisualName?.includes('||')) {
    // is transclusion with template
    return linkWithVisualName?.replace(/\|\|.*$/, '') ?? '';
  }
  // is link with visual name
  return linkWithVisualName?.replace(/^.*\|/, '') ?? '';
}
