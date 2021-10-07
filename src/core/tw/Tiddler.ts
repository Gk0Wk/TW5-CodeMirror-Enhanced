export interface TiddlerField {
  [fieldName: string]: string | Date;
}

export interface Tiddler {
  cache: Record<string, unknown>;
  fields: TiddlerField;
}

export interface PluginInfo {
  tiddlers: Record<string, TiddlerField>;
}

// export interface I$TW {
//   node?: boolean;
//   boot: {
//     argv: string[];
//     startup: (options: { callback: () => unknown }) => void;
//     wikiTiddlersPath?: string;
//     wikiInfo?: { config?: { watchFolder?: string } };
//     files: Record<string, ICachedFile>;
//   };
//   wiki: ITWWiki;
//   syncadaptor: {
//     wiki: ITWWiki;
//   };
// }
// declare var $tw: I$TW;

// /**
//  * {
//  *   [filepath: string]: {
//  *     filepath: '/Users/linonetwo/xxxx/wiki/Meme-of-LinOnetwo/tiddlers/tiddlerTitle.tid',
//  *     tiddlerTitle: string,
//  *     type: 'application/x-tiddler',
//  *     hasMetaFile: false
//  *   }
//  * }
//  */
// export interface ICachedFile {
//   filepath: string;
//   title: string;
//   type: string;
//   hasMetaFile: boolean;
// }
