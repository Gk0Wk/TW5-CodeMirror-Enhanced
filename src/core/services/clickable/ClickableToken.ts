declare var $tw: any;
import * as ServiceManager from "../ServiceManager";
import Options from "../../Options";

const functionKey = /macintosh|mac os x/i.test(navigator.userAgent)
  ? "metaKey"
  : "ctrlKey";

interface ClickableAddon {
  handler: (editor: any, event: any) => boolean;
}

export function init(): void {
  ServiceManager.registerService({
    name: "ClickableToken",
    tag: "$:/CodeMirrorEnhanced/ClickableToken",
    onLoad: function (CodeMirror: any): void {},
    onHook: function (editor: any, name: string): void {
      editor.on("mousedown", function (cm: any, event: any) {
        if (event[functionKey] && Options.clickableService) {
          let addons: ServiceManager.Addons =
            ServiceManager.getAddons("ClickableToken");
          for (let key in addons) {
            if ((addons[key] as ClickableAddon).handler(editor, event)) break;
          }
        }
      });
    },
  });
}
