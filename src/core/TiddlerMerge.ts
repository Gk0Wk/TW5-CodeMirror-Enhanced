declare var $tw: any;

import { loadTiddler } from "./utils/tiddlerIO";

function getOriginalShadowTiddler(tiddler: string): any {
  var source: string = $tw.wiki.getShadowSource(tiddler);
  if (!source) return null;
  var plugin: any = $tw.wiki.getPluginInfo(source);
  if (!plugin) return null;
  return plugin.tiddlers[tiddler];
}

function isOverrideCMEShadowTiddler(tiddler: string): boolean {
  return (
    $tw.wiki.filterTiddlers(
      "[field:title[$:/plugins/Gk0Wk/TW5-CodeMirror-Enhanced/config.json]is[shadow]]"
    ).length > 0
  );
}

function getOverridei18nShadowTiddler(): Array<string> {
  return $tw.wiki.filterTiddlers("[!field:cmei18n[]!is[draft]is[shadow]]");
}

function mergeShadowAndTiddler(tiddler: string): any {
  // Get Override Shadow Tiddler
  let overrideTiddlerObject = loadTiddler(tiddler);
  if (!overrideTiddlerObject) $tw.wiki.deleteTiddler(tiddler);

  // Get Original Shadow Tiddler
  let shadowTiddlerObject = JSON.parse(
    $tw.wiki.getPluginInfo("$:/plugins/Gk0Wk/TW5-CodeMirror-Enhanced").tiddlers[
      tiddler
    ].text
  );
  if (!shadowTiddlerObject) return;

  // Merge tiddler: shadow <- override
  return new $tw.Tiddler(
    $tw.wiki.getCreationFields(),
    $tw.wiki.getPluginInfo("$:/plugins/Gk0Wk/TW5-CodeMirror-Enhanced").tiddlers[
      tiddler
    ],
    $tw.wiki.getTiddler(tiddler),
    {
      text: JSON.stringify(
        Object.assign(shadowTiddlerObject, overrideTiddlerObject),
        null,
        4
      ),
    },
    $tw.wiki.getModificationFields()
  );
}

export function init(CodeMirror: any): object {
  // Merge config file
  if (
    isOverrideCMEShadowTiddler(
      "$:/plugins/Gk0Wk/TW5-CodeMirror-Enhanced/config.json"
    )
  )
    $tw.wiki.addTiddler(
      mergeShadowAndTiddler(
        "$:/plugins/Gk0Wk/TW5-CodeMirror-Enhanced/config.json"
      )
    );

  // Merge i18n files
  getOverridei18nShadowTiddler().forEach((tiddler) =>
    $tw.wiki.addTiddler(mergeShadowAndTiddler(tiddler))
  );

  $tw.hooks.addHook("th-saving-tiddler", (newTiddler: any): any => {
    let tmpTiddler = newTiddler;
    if (
      tmpTiddler.fields.title &&
      (tmpTiddler.fields.title ===
        "$:/plugins/Gk0Wk/TW5-CodeMirror-Enhanced/config.json" ||
        tmpTiddler.fields.cmei18n)
    )
      tmpTiddler = mergeShadowAndTiddler(newTiddler.fields.title);
    return tmpTiddler;
  });

  $tw.hooks.addHook("th-importing-tiddler", (tiddler: any): any => {
    let tmpTiddler = tiddler;
    if (
      tmpTiddler.fields.title &&
      (tmpTiddler.fields.title ===
        "$:/plugins/Gk0Wk/TW5-CodeMirror-Enhanced/config.json" ||
        tmpTiddler.fields.cmei18n)
    )
      tmpTiddler = mergeShadowAndTiddler(tiddler.fields.title);
    return tmpTiddler;
  });

  return {
    getOriginalShadowTiddler,
    isOverrideCMEShadowTiddler,
  };
}
