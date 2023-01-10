import { Tiddler, ITiddlerFields } from 'tiddlywiki';
import { loadTiddler } from './utils/tiddlerIO';

interface PluginInfo {
  tiddlers: Record<string, ITiddlerFields>;
}

const getOriginalShadowTiddler = (
  tiddler: string,
): ITiddlerFields | undefined => {
  const source: string = $tw.wiki.getShadowSource(tiddler) as string;
  if (source === undefined) {
    return undefined;
  }
  const plugin: PluginInfo = ($tw.wiki as any).getPluginInfo(source);
  if (plugin === undefined) {
    return undefined;
  }
  return plugin.tiddlers[tiddler];
};

const isOverrideCMEShadowTiddler = (tiddler: string) =>
  $tw.wiki.filterTiddlers(`[field:title[${tiddler}]is[shadow]]`).length > 0;

const getOverridei18nShadowTiddler = () =>
  $tw.wiki.filterTiddlers('[!field:cmei18n[]!is[draft]is[shadow]]');

const mergeShadowAndTiddler = (tiddler: string): Tiddler | undefined => {
  // Get Override Shadow Tiddler
  const overrideTiddlerObject = loadTiddler(tiddler);
  if (overrideTiddlerObject === undefined) {
    $tw.wiki.deleteTiddler(tiddler);
  }

  // Get Original Shadow Tiddler
  const plugin: PluginInfo = ($tw.wiki as any).getPluginInfo(
    '$:/plugins/Gk0Wk/TW5-CodeMirror-Enhanced',
  );
  let shadowTiddlerObject: Record<string, unknown>;
  try {
    if (
      plugin.tiddlers[tiddler].type !== undefined &&
      plugin.tiddlers[tiddler].type === 'application/x-tiddler-dictionary'
    ) {
      shadowTiddlerObject = $tw.utils.parseFields(
        plugin.tiddlers[tiddler].text,
      ) as any;
    } else {
      shadowTiddlerObject = JSON.parse(plugin.tiddlers[tiddler].text);
    }
  } catch (error) {
    console.error(error);
    return undefined;
  }

  // Merge tiddler: shadow <- override
  // TODO: change it to deep copy
  return new $tw.Tiddler({
    ...($tw.wiki as any).getCreationFields(),
    ...($tw.wiki as any).getPluginInfo(
      '$:/plugins/Gk0Wk/TW5-CodeMirror-Enhanced',
    ).tiddlers[tiddler],
    ...$tw.wiki.getTiddler(tiddler),
    text: JSON.stringify(
      { ...shadowTiddlerObject, ...overrideTiddlerObject },
      null,
      4,
    ),
    ...($tw.wiki as any).getModificationFields(),
  });
};

const checkIncomingTiddler = (tiddler: Tiddler): Tiddler | undefined => {
  if (
    tiddler.fields.title !== undefined &&
    (tiddler.fields.title ===
      '$:/plugins/Gk0Wk/TW5-CodeMirror-Enhanced/config.json' ||
      tiddler.fields.cmei18n !== undefined)
  ) {
    return mergeShadowAndTiddler(tiddler.fields.title);
  } else {
    return tiddler;
  }
};

export function init(): Record<string, unknown> {
  // Merge config file
  if (
    isOverrideCMEShadowTiddler(
      '$:/plugins/Gk0Wk/TW5-CodeMirror-Enhanced/config.json',
    )
  ) {
    const mergedTiddler = mergeShadowAndTiddler(
      '$:/plugins/Gk0Wk/TW5-CodeMirror-Enhanced/config.json',
    );
    if (mergedTiddler !== undefined) {
      $tw.wiki.addTiddler(mergedTiddler);
    } else {
      $tw.wiki.deleteTiddler(
        '$:/plugins/Gk0Wk/TW5-CodeMirror-Enhanced/config.json',
      );
    }
  }

  // Merge i18n files
  $tw.utils.each(getOverridei18nShadowTiddler(), i18nShadowTiddler => {
    const mergedTiddler = i18nShadowTiddler
      ? mergeShadowAndTiddler(i18nShadowTiddler)
      : undefined;
    if (mergedTiddler !== undefined) {
      $tw.wiki.addTiddler(mergedTiddler);
    } else {
      $tw.wiki.deleteTiddler(i18nShadowTiddler!);
    }
  });

  ($tw.hooks.addHook as any)('th-saving-tiddler', checkIncomingTiddler);
  ($tw.hooks.addHook as any)('th-importing-tiddler', checkIncomingTiddler);

  return {
    getOriginalShadowTiddler,
    isOverrideCMEShadowTiddler,
  };
}
