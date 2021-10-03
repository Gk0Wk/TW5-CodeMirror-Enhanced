declare var $tw: any;
declare function require(path: string): any;

export interface Addons {
  [addonName: string]: unknown;
}

export interface Service {
  readonly name: string;
  readonly tag?: string | null;
  readonly api?: object;
  readonly onLoad: (CodeMirror: any, cme: object) => void;
  readonly onHook: (editor: any, cme: object) => void;
}

export class InnerService implements Service {
  public readonly name: string;
  public readonly tag: string | null;
  public readonly onLoad: (CodeMirror: any, cme: object) => void;
  public readonly onHook: (editor: any, cme: object) => void;
  public readonly addons: Addons;
  public readonly isHackEvent: boolean;
  public lastAddonsUpdateTime: Date;
  public isLoad: boolean;
  constructor(bald: Service) {
    this.name = bald.name;
    this.tag = bald.tag ? bald.tag : null;
    this.onLoad = bald.onLoad;
    this.onHook = bald.onHook;
    this.addons = {};
    this.isLoad = false;
    this.lastAddonsUpdateTime = new Date(0);
  }
}

interface Services {
  [serviceName: string]: InnerService;
}

const services: Services = {};

var api = {};

function loadTiddler(tiddler: string): object | null {
  switch ($tw.wiki.getTiddler(tiddler).fields.type) {
    case "application/javascript":
      return require(tiddler);
    case "application/json":
      return JSON.parse($tw.wiki.getTiddlerText(tiddler));
    case "application/x-tiddler-dictionary":
      return $tw.utils.parseFields($tw.wiki.getTiddlerText(tiddler));
    default:
      return null;
  }
}

function updateService(): void {
  $tw.utils.each(
    services,
    function (service: InnerService, name: string): void {
      // Update add-ons
      if (!service.tag) return;
      let tiddlers: Array<string> = $tw.wiki.filterTiddlers(
        `[all[tiddlers+shadows]tag[${service.tag}]!is[draft]]`
      );
      $tw.utils.each(tiddlers, function (tiddler: string): void {
        if (!(tiddler in service.addons)) {
          // load add-on not loaded before
          let addon = loadTiddler(tiddler);
          if (addon) service.addons[tiddler] = addon;
        } else {
          // reload add-on updated after last check
          let tiddlerData = $tw.wiki.getTiddler(tiddler);
          if (
            tiddlerData &&
            tiddlerData.fields &&
            ((tiddlerData.fields.modified &&
              tiddlerData.fields.modified >= service.lastAddonsUpdateTime) ||
              (tiddlerData.fields.created &&
                tiddlerData.fields.created >= service.lastAddonsUpdateTime))
          ) {
            let addon = loadTiddler(tiddler);
            if (addon) service.addons[tiddler] = addon;
            else delete service.addons[tiddler];
          }
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
      // Update add-on update time
      service.lastAddonsUpdateTime = new Date();
    }
  );
}

export function registerService(service: Service): void {
  services[service.name] = new InnerService(service);
  if (service.api) api[service.name] = service.api;
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

export function init(CodeMirror: any, cme: object): object {
  // When new editor instance is created, update addons and hook service
  CodeMirror.defineInitHook(function (editor: any): void {
    updateService();
    $tw.utils.each(
      services,
      function (service: InnerService, name: string): void {
        if (!service.isLoad) service.onLoad(CodeMirror, cme);
        service.onHook(editor, cme);
      }
    );
  });
  return api;
}
