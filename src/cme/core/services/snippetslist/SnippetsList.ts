import * as ServiceManager from '../ServiceManager';
import { Addons, getAddons } from '../ServiceManager';

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

export function init() {
  ServiceManager.registerService({
    name: 'SnippetsList',
    tag: '$:/CodeMirrorEnhanced/SnippetsList',
    onLoad() {
      // Do nothing
    },
    onHook() {
      // Do nothing
    },
    api: {
      getSnippetsList,
    },
  });
}
