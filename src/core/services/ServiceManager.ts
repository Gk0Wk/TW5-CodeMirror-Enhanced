declare var $tw: any;
declare function require(path: string): any;

export interface Addons {
  [addonName: string]: unknown;
}

export interface Service {
  readonly name: string;
  readonly tag?: string | null;
  readonly onLoad: (CodeMirror: any, name: string) => void;
  readonly onHook: (editor: any, name: string) => void;
}

export class InnerService implements Service {
  public readonly name: string;
  public readonly tag: string | null;
  public readonly onLoad: (CodeMirror: any, name: string) => void;
  public readonly onHook: (editor: any, name: string) => void;
  public readonly addons: Addons;
  public readonly isHackEvent: boolean;
  public isLoad: boolean;
  constructor(bald: Service) {
    this.name = bald.name;
    this.tag = bald.tag ? bald.tag : null;
    this.onLoad = bald.onLoad;
    this.onHook = bald.onHook;
    this.addons = {};
    this.isLoad = false;
  }
}

interface Services {
  [serviceName: string]: InnerService;
}

const services: Services = {};

function updateService(): void {
  $tw.utils.each(
    services,
    function (service: InnerService, name: string): void {
      if (!service.tag) return;
      let tiddlers: Array<string> = $tw.wiki.filterTiddlers(
        `[all[tiddlers+shadows]tag[${service.tag}]!is[draft]type[application/javascript]]`
      );
      $tw.utils.each(tiddlers, function (tiddler: string): void {
        if (!(tiddler in service.addons)) {
          service.addons[tiddler] = require(tiddler);
        }
      });
      $tw.utils.each(
        service.addons,
        function (addon: unknown, tiddler: string): void {
          if (tiddler! in tiddlers) {
            delete service.addons[tiddler];
          }
        }
      );
    }
  );
}

export function registerService(service: Service): void {
  services[service.name] = new InnerService(service);
}

export function unregisterService(name: string): void {
  delete services[name];
}

export function getService(name: string): InnerService {
  return services[name];
}

export function getAddons(name: string): Addons {
  return services[name].addons;
}

export function init(CodeMirror: any): void {
  // When new editor instance is created,
  CodeMirror.defineInitHook(function (editor: any): void {
    updateService();
    $tw.utils.each(
      services,
      function (service: InnerService, name: string): void {
        if (!service.isLoad) service.onLoad(CodeMirror, name);
        service.onHook(editor, name);
      }
    );
  });
}
