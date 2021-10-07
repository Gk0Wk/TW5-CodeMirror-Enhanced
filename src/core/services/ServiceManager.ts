import { loadTiddler } from '../utils/tiddlerIO';
import * as CodeMirror from 'codemirror';
import { Tiddler } from '../tw/Tiddler';

declare let $tw: unknown;

export interface Addons {
  [addonName: string]: unknown;
}

export interface Service {
  readonly api?: Record<string, unknown>;
  readonly name: string;
  readonly onHook: (editor: CodeMirror.Editor, cme: Record<string, unknown>) => void;
  readonly onLoad: (cme: Record<string, unknown>) => void;
  readonly tag?: string;
}

export class InnerService implements Service {
  public readonly name: string;
  public readonly tag?: string;
  public readonly onLoad: (cme: Record<string, unknown>) => void;
  public readonly onHook: (editor: CodeMirror.Editor, cme: Record<string, unknown>) => void;
  public readonly addons: Addons;
  public lastAddonsUpdateTime: Date;
  public isLoad: boolean;
  constructor(bald: Service) {
    this.name = bald.name;
    this.tag = bald.tag !== undefined ? bald.tag : undefined;
    this.onLoad = bald.onLoad;
    this.onHook = bald.onHook;
    this.addons = {};
    this.isLoad = false;
    this.lastAddonsUpdateTime = new Date(0);
  }
}

const services: Record<string, InnerService> = {};

const api: Record<string, unknown> = {};

function updateService(): void {
  $tw.utils.each(services, function (service: InnerService, name: string): void {
    // Update add-ons
    if (service.tag === undefined) return;
    const tiddlers: string[] = $tw.wiki.filterTiddlers(`[all[tiddlers+shadows]tag[${service.tag}]!is[draft]]`) as string[];

    // register each existing addon tiddler
    for (let index = 0, length = tiddlers.length; index < length; index++) {
      const tiddler: string = tiddlers[index];
      if (!(tiddler in service.addons)) {
        // load add-on not loaded before
        const addon = loadTiddler(tiddler);
        if (addon !== undefined) service.addons[tiddler] = addon;
      } else {
        // reload add-on updated after last check
        const tiddlerData: Tiddler | undefined = $tw.wiki.getTiddler(tiddler) as Tiddler | undefined;
        if (
          tiddlerData !== undefined &&
          ((tiddlerData.fields.modified !== undefined && (tiddlerData.fields.modified as Date) >= service.lastAddonsUpdateTime) ||
            (tiddlerData.fields.created !== undefined && (tiddlerData.fields.created as Date) >= service.lastAddonsUpdateTime))
        ) {
          const addon = loadTiddler(tiddler);
          if (addon !== undefined) service.addons[tiddler] = addon;
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          else delete service.addons[tiddler];
        }
      }
    }

    // Unregister tiddlers already without tag
    $tw.utils.each(service.addons, function (addon: unknown, tiddler: string): void {
      if (!tiddlers.includes(tiddler)) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete service.addons[tiddler];
      }
    });
    // Update add-on update time
    service.lastAddonsUpdateTime = new Date();
  });
}

export function registerService(service: Service): void {
  services[service.name] = new InnerService(service);
  if (service.api !== undefined) api[service.name] = service.api;
}

export function unregisterService(name: string): void {
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete services[name];
}

export function getService(name: string): InnerService {
  return services[name];
}

export function getAddons(name: string): Addons {
  return services[name].addons;
}

export function init(cme: Record<string, unknown>): Record<string, unknown> {
  // When new editor instance is created, update addons and hook service
  CodeMirror.defineInitHook(function (editor: CodeMirror.Editor): void {
    updateService();
    $tw.utils.each(services, function (service: InnerService, name: string): void {
      if (!service.isLoad) service.onLoad(cme);
      service.onHook(editor, cme);
    });
  });
  return api;
}
