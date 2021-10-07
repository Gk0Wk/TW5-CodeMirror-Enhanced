import * as ServiceManager from '../ServiceManager';
import { Addons, getAddons } from '../ServiceManager';
import * as cm from 'codemirror';

export interface ISnippet {
  /** whether to enable i18n for name and preview, if this is true, then name and preview should be i18n key instead of literal */
  i18n?: boolean;
  /** id for search */
  id: string;
  /** name to display and search */
  name: string;
  preview: string;
  snippet: string;
}

function getSnippetsList(): Addons {
  return getAddons('SnippetsList');
}

export function init(): void {
  ServiceManager.registerService({
    name: 'SnippetsList',
    tag: '$:/CodeMirrorEnhanced/SnippetsList',
    onLoad: function (CodeMirror: any, cme: object): void {},
    onHook: function (editor: cm.Editor, cme: object): void {},
    api: {
      getSnippetsList,
    },
  });
}
