import CodeMirror, { Editor } from 'codemirror';
import { loadTiddler } from '../utils/tiddlerIO';

declare let $tw: any;

export interface Addons {
  [addonName: string]: unknown;
}

export interface Service {
  readonly api?: object;
  readonly name: string;
  readonly onHook: (editor: any, cme: Editor) => void;
  readonly onLoad: (codeMirror: any, cme: Editor) => void;
  readonly tag?: string | null;
}

export class InnerService implements Service {
  public readonly name: string;
  public readonly tag: string | null;
  public readonly onLoad: (CodeMirror: any, cme: Editor) => void;
  public readonly onHook: (editor: any, cme: Editor) => void;
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

const api = {};

function updateService(): void {
  $tw.utils.each(services, function (service: InnerService, name: string): void {
    // Update add-ons
    if (!service.tag) return;
    const tiddlers: string[] = $tw.wiki.filterTiddlers(`[all[tiddlers+shadows]tag[${service.tag}]!is[draft]]`);
    $tw.utils.each(tiddlers, function (tiddler: string): void {
      if (!(tiddler in service.addons)) {
        // load add-on not loaded before
        const addon = loadTiddler(tiddler);
        if (addon != undefined) service.addons[tiddler] = addon;
      } else {
        // reload add-on updated after last check
        const tiddlerData = $tw.wiki.getTiddler(tiddler);
        if (
          tiddlerData &&
          tiddlerData.fields &&
          ((tiddlerData.fields.modified && tiddlerData.fields.modified >= service.lastAddonsUpdateTime) ||
            (tiddlerData.fields.created && tiddlerData.fields.created >= service.lastAddonsUpdateTime))
        ) {
          const addon = loadTiddler(tiddler);
          if (addon != undefined) service.addons[tiddler] = addon;
          else delete service.addons[tiddler];
        }
      }
    });
    $tw.utils.each(service.addons, function (addon: unknown, tiddler: string): void {
      if (tiddler in tiddlers) {
        delete service.addons[tiddler];
      }
    });
    // Update add-on update time
    service.lastAddonsUpdateTime = new Date();
  });
}

export function registerService(service: Service): void {
  services[service.name] = new InnerService(service);
  if (service.api != undefined) api[service.name] = service.api;
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
    $tw.utils.each(services, function (service: InnerService, name: string): void {
      if (!service.isLoad) service.onLoad(CodeMirror, cme);
      service.onHook(editor, cme);
    });
  });
  return api;
}
