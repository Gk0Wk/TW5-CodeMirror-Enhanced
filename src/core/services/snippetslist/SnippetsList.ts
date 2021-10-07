import * as ServiceManager from '../ServiceManager';
import { Addons, getAddons } from '../ServiceManager';
declare let $tw: any;

function getSnippetsList(): Addons {
  return getAddons('SnippetsList');
}

export function init(): void {
  ServiceManager.registerService({
    name: 'SnippetsList',
    tag: '$:/CodeMirrorEnhanced/SnippetsList',
    onLoad: function (CodeMirror: any, cme: object): void {},
    onHook: function (editor: any, cme: object): void {},
    api: {
      getSnippetsList,
    },
  });
}
