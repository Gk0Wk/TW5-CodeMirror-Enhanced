import { loadTiddler } from './utils/tiddlerIO';
import { Tiddler, PluginInfo, TiddlerField } from './tw/Tiddler';

declare let $tw: unknown;

function getOriginalShadowTiddler(tiddler: string): TiddlerField | undefined {
  const source: string = $tw.wiki.getShadowSource(tiddler) as string;
  if (source === undefined) return undefined;
  const plugin = $tw.wiki.getPluginInfo(source) as PluginInfo;
  if (plugin === undefined) return undefined;
  return plugin.tiddlers[tiddler];
}

function isOverrideCMEShadowTiddler(tiddler: string): boolean {
  return ($tw.wiki.filterTiddlers('[field:title[$:/plugins/Gk0Wk/TW5-CodeMirror-Enhanced/config.json]is[shadow]]') as string[]).length > 0;
}

function getOverridei18nShadowTiddler(): string[] {
  return $tw.wiki.filterTiddlers('[!field:cmei18n[]!is[draft]is[shadow]]') as string[];
}

function mergeShadowAndTiddler(tiddler: string): Tiddler | undefined {
  // Get Override Shadow Tiddler
  const overrideTiddlerObject = loadTiddler(tiddler);
  if (overrideTiddlerObject === undefined) $tw.wiki.deleteTiddler(tiddler);

  // Get Original Shadow Tiddler
  const plugin: PluginInfo = $tw.wiki.getPluginInfo('$:/plugins/Gk0Wk/TW5-CodeMirror-Enhanced') as PluginInfo;
  let shadowTiddlerObject: unknown;
  try {
    shadowTiddlerObject = JSON.parse(plugin.tiddlers[tiddler].text as string) as unknown;
  } catch (error) {
    console.error(error);
    return undefined;
  }

  // Merge tiddler: shadow <- override
  return new $tw.Tiddler(
    $tw.wiki.getCreationFields(),
    $tw.wiki.getPluginInfo('$:/plugins/Gk0Wk/TW5-CodeMirror-Enhanced').tiddlers[tiddler],
    $tw.wiki.getTiddler(tiddler),
    {
      text: JSON.stringify(Object.assign(shadowTiddlerObject, overrideTiddlerObject), null, 4),
    },
    $tw.wiki.getModificationFields(),
  ) as Tiddler;
}

function checkIncomingTiddler(tiddler: Tiddler): Tiddler | undefined {
  let temporaryTiddler: Tiddler | undefined = tiddler;
  if (
    temporaryTiddler.fields.title !== undefined &&
    (temporaryTiddler.fields.title === '$:/plugins/Gk0Wk/TW5-CodeMirror-Enhanced/config.json' || temporaryTiddler.fields.cmei18n !== undefined)
  )
    temporaryTiddler = mergeShadowAndTiddler(tiddler.fields.title as string);
  return temporaryTiddler;
}

export function init(): Record<string, unknown> {
  // Merge config file
  if (isOverrideCMEShadowTiddler('$:/plugins/Gk0Wk/TW5-CodeMirror-Enhanced/config.json')) {
    const mergedTiddler = mergeShadowAndTiddler('$:/plugins/Gk0Wk/TW5-CodeMirror-Enhanced/config.json');
    if (mergedTiddler !== undefined) $tw.wiki.addTiddler(mergedTiddler);
    else $tw.wiki.deleteTiddler('$:/plugins/Gk0Wk/TW5-CodeMirror-Enhanced/config.json');
  }

  // Merge i18n files
  $tw.utils.each(getOverridei18nShadowTiddler(), (i18nShadowTiddler) => {
    const mergedTiddler = mergeShadowAndTiddler(i18nShadowTiddler);
    if (mergedTiddler !== undefined) $tw.wiki.addTiddler(mergedTiddler);
    else $tw.wiki.deleteTiddler(i18nShadowTiddler);
  });

  $tw.hooks.addHook('th-saving-tiddler', checkIncomingTiddler);
  $tw.hooks.addHook('th-importing-tiddler', checkIncomingTiddler);

  return {
    getOriginalShadowTiddler,
    isOverrideCMEShadowTiddler,
  };
}
