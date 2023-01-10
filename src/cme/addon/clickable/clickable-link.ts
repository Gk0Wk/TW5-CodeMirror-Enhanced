/* Enhance from and specially thank to https://github.com/adithya-badidey/TW5-codemirror-plus */
export const handler = (_editor: any, event: MouseEvent) => {
  if ((event.target as HTMLElement).classList.contains('cm-externallink')) {
    window.open((event.target as HTMLElement).innerText);
    return true;
  } else if (
    (event.target as HTMLElement).classList.contains('cm-internallink')
  ) {
    new ($tw as any).Story().navigateTiddler(
      (event.target as HTMLElement).innerText,
    );
    return true;
  } else {
    return false;
  }
};
