import { loadTiddler } from '../utils/tiddlerIO';
import { Editor } from 'codemirror';
import { Tiddler } from '../tw/Tiddler';

declare let $tw: any;

export interface Addons {
  [addonName: string]: unknown;
}

export interface Service {
  readonly api?: Record<string, unknown>;
  readonly name: string;
  readonly onHook: (editor: Editor, cme: any) => void;
  readonly onLoad: (codeMirror: any, cme: any) => void;
  readonly tag?: string;
}

export class InnerService implements Service {
  public readonly name: string;
  public readonly tag?: string;
  public readonly onLoad: (CodeMirror: any, cme: any) => void;
  public readonly onHook: (editor: Editor, cme: any) => void;
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
    $tw.utils.each(tiddlers, function (tiddler: string): void {
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
    });
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

export function init(CodeMirror: any, cme: Record<string, unknown>): Record<string, unknown> {
  // When new editor instance is created, update addons and hook service
  CodeMirror.defineInitHook(function (editor: Editor): void {
    updateService();·
    $tw.utils.each(services, function (service: InnerService, name: string): void {
      if (!service.isLoad) service.onLoad(CodeMirror, cme);
      service.onHook(editor, cme);
    });
  });
  return api;
}
