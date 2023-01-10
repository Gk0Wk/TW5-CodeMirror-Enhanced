import { Editor } from 'codemirror';
import Options from '../../Options';
import * as ServiceManager from '../ServiceManager';

const functionKey = /macintosh|mac os x/i.test(navigator.userAgent)
  ? 'metaKey'
  : 'ctrlKey';

interface ClickableAddon {
  handler: (
    editor: Editor,
    event: MouseEvent,
    cme: Record<string, unknown>,
  ) => boolean;
}

export function init() {
  ServiceManager.registerService({
    name: 'ClickableToken',
    tag: '$:/CodeMirrorEnhanced/ClickableToken',
    onLoad() {
      // Do nothing
    },
    onHook(editor: Editor, cme: Record<string, unknown>) {
      editor.on<'mousedown'>(
        'mousedown',
        function (cm: Editor, event: MouseEvent) {
          if (event[functionKey] && Options.clickableService) {
            const addons: ServiceManager.Addons =
              ServiceManager.getAddons('ClickableToken');
            for (const addon of addons.values()) {
              if ((addon as ClickableAddon).handler(editor, event, cme)) {
                break;
              }
            }
          }
        },
      );
    },
  });
}
