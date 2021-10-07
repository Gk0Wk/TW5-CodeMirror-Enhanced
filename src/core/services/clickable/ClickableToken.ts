import * as ServiceManager from '../ServiceManager';
import Options from '../../Options';
import { Editor } from 'codemirror';

const functionKey = /macintosh|mac os x/i.test(navigator.userAgent) ? 'metaKey' : 'ctrlKey';

interface ClickableAddon {
  handler: (editor: Editor, event: any, cme: object) => boolean;
}

export function init(): void {
  ServiceManager.registerService({
    name: 'ClickableToken',
    tag: '$:/CodeMirrorEnhanced/ClickableToken',
    onLoad: function (CodeMirror: any, cme: object): void {},
    onHook: function (editor: Editor, cme: object): void {
      editor.on('mousedown', function (cm: Editor, event: MouseEvent) {
        if (event[functionKey] && Options.clickableService) {
          const addons: ServiceManager.Addons = ServiceManager.getAddons('ClickableToken');
          for (const key in addons) {
            if ((addons[key] as ClickableAddon).handler(editor, event, cme)) break;
          }
        }
      });
    },
  });
}
