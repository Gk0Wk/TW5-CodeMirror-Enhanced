export interface I$TW {
  node?: boolean;
  boot: {
    argv: string[];
    startup: (options: { callback: () => unknown }) => void;
    wikiTiddlersPath?: string;
    wikiInfo?: { config?: { watchFolder?: string } };
    files: Record<string, ICachedFile>;
  };
  wiki: ITWWiki;
  syncadaptor: {
    wiki: ITWWiki;
  };
}
declare var $tw: I$TW;
