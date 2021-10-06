import { loadTiddler } from './utils/tiddlerIO';

declare let $tw: any;

function getOriginalShadowTiddler(tiddler: string): any {
  const source: string = $tw.wiki.getShadowSource(tiddler);
  if (!source) return null;
  const plugin: any = $tw.wiki.getPluginInfo(source);
  if (!plugin) return null;
  return plugin.tiddlers[tiddler];
}

function isOverrideCMEShadowTiddler(tiddler: string): boolean {
  return $tw.wiki.filterTiddlers('[field:title[$:/plugins/Gk0Wk/TW5-CodeMirror-Enhanced/config.json]is[shadow]]').length > 0;
}

function getOverridei18nShadowTiddler(): string[] {
  return $tw.wiki.filterTiddlers('[!field:cmei18n[]!is[draft]is[shadow]]');
}

function mergeShadowAndTiddler(tiddler: string): any {
  // Get Override Shadow Tiddler
  const overrideTiddlerObject = loadTiddler(tiddler);
  if (overrideTiddlerObject == undefined) $tw.wiki.deleteTiddler(tiddler);

  // Get Original Shadow Tiddler
  const shadowTiddlerObject = JSON.parse($tw.wiki.getPluginInfo('$:/plugins/Gk0Wk/TW5-CodeMirror-Enhanced').tiddlers[tiddler].text);
  if (!shadowTiddlerObject) return;

  // Merge tiddler: shadow <- override
  return new $tw.Tiddler(
    $tw.wiki.getCreationFields(),
    $tw.wiki.getPluginInfo('$:/plugins/Gk0Wk/TW5-CodeMirror-Enhanced').tiddlers[tiddler],
    $tw.wiki.getTiddler(tiddler),
    {
      text: JSON.stringify(Object.assign(shadowTiddlerObject, overrideTiddlerObject), null, 4),
    },
    $tw.wiki.getModificationFields(),
  );
}

export function init(CodeMirror: any): object {
  // Merge config file
  if (isOverrideCMEShadowTiddler('$:/plugins/Gk0Wk/TW5-CodeMirror-Enhanced/config.json'))
    $tw.wiki.addTiddler(mergeShadowAndTiddler('$:/plugins/Gk0Wk/TW5-CodeMirror-Enhanced/config.json'));

  // Merge i18n files
  getOverridei18nShadowTiddler().forEach((tiddler) => $tw.wiki.addTiddler(mergeShadowAndTiddler(tiddler)));

  $tw.hooks.addHook('th-saving-tiddler', (newTiddler: any): any => {
    let temporaryTiddler = newTiddler;
    if (
      temporaryTiddler.fields.title &&
      (temporaryTiddler.fields.title === '$:/plugins/Gk0Wk/TW5-CodeMirror-Enhanced/config.json' || temporaryTiddler.fields.cmei18n)
    )
      temporaryTiddler = mergeShadowAndTiddler(newTiddler.fields.title);
    return temporaryTiddler;
  });

  $tw.hooks.addHook('th-importing-tiddler', (tiddler: any): any => {
    let temporaryTiddler = tiddler;
    if (
      temporaryTiddler.fields.title &&
      (temporaryTiddler.fields.title === '$:/plugins/Gk0Wk/TW5-CodeMirror-Enhanced/config.json' || temporaryTiddler.fields.cmei18n)
    )
      temporaryTiddler = mergeShadowAndTiddler(tiddler.fields.title);
    return temporaryTiddler;
  });

  return {
    getOriginalShadowTiddler,
    isOverrideCMEShadowTiddler,
  };
}
