declare var $tw: any;
import * as ServiceManager from "../ServiceManager";
import Options from "../../Options";

const functionKey = /macintosh|mac os x/i.test(navigator.userAgent)
  ? "metaKey"
  : "ctrlKey";

interface ClickableAddon {
  handler: (editor: any, event: any, cme: object) => boolean;
}

export function init(): void {
  ServiceManager.registerService({
    name: "ClickableToken",
    tag: "$:/CodeMirrorEnhanced/ClickableToken",
    onLoad: function (CodeMirror: any, cme: object): void {},
    onHook: function (editor: any, cme: object): void {
      editor.on("mousedown", function (cm: any, event: any) {
        if (event[functionKey] && Options.clickableService) {
          let addons: ServiceManager.Addons =
            ServiceManager.getAddons("ClickableToken");
          for (let key in addons) {
            if ((addons[key] as ClickableAddon).handler(editor, event, cme)) break;
          }
        }
      });
    },
  });
}
