import { Editor } from 'codemirror';
import { loadTiddler } from '../utils/tiddlerIO';

const CodeMirror = require('$:/plugins/tiddlywiki/codemirror/lib/codemirror.js');

export type Addons = Map<string, unknown>;

export interface Service {
  readonly api?: Record<string, unknown>;
  readonly name: string;
  readonly onHook: (editor: Editor, cme: Record<string, unknown>) => void;
  readonly onLoad: (cme: Record<string, unknown>) => void;
  readonly tag?: string;
}

export class InnerService implements Service {
  public readonly name: string;

  public readonly tag?: string;

  public readonly onLoad: (cme: Record<string, unknown>) => void;

  public readonly onHook: (
    editor: Editor,
    cme: Record<string, unknown>,
  ) => void;

  public readonly addons: Addons = new Map();

  public lastAddonsUpdateTime: Date = new Date(0);

  public isLoad: boolean = false;

  constructor(bald: Service) {
    this.name = bald.name;
    this.tag = bald.tag !== undefined ? bald.tag : undefined;
    this.onLoad = bald.onLoad;
    this.onHook = bald.onHook;
  }
}

const services: Record<string, InnerService> = {};

const api: Record<string, unknown> = {};

function updateService(): void {
  $tw.utils.each(services, service => {
    // Update add-ons
    if (service?.tag === undefined) {
      return;
    }
    const tiddlers = $tw.wiki.filterTiddlers(
      `[all[tiddlers+shadows]tag[${service.tag}]!is[draft]]`,
    );

    // register each existing addon tiddler
    $tw.utils.each(tiddlers, tiddler => {
      if (!tiddler) {
        return;
      }
      if (!service.addons.has(tiddler)) {
        // load add-on not loaded before
        const addon = loadTiddler(tiddler);
        if (addon !== undefined) {
          service.addons.set(tiddler, addon);
        }
      } else {
        // reload add-on updated after last check
        const tiddlerData = $tw.wiki.getTiddler(tiddler);
        if (
          tiddlerData !== undefined &&
          ((tiddlerData.fields.modified !== undefined &&
            tiddlerData.fields.modified >= service.lastAddonsUpdateTime) ||
            (tiddlerData.fields.created !== undefined &&
              tiddlerData.fields.created >= service.lastAddonsUpdateTime))
        ) {
          const addon = loadTiddler(tiddler);
          if (addon !== undefined) {
            service.addons.set(tiddler, addon);
          } else {
            service.addons.delete(tiddler);
          }
        }
      }
    });

    // Unregister tiddlers already without tag
    for (const [tiddler] of service.addons) {
      if (!tiddlers.includes(tiddler)) {
        service.addons.delete(tiddler);
      }
    }
    // Update add-on update time
    service.lastAddonsUpdateTime = new Date();
  });
}

export function registerService(service: Service): void {
  services[service.name] = new InnerService(service);
  if (service.api !== undefined) {
    api[service.name] = service.api;
  }
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

export function init(cme: Record<string, unknown>): Record<string, unknown> {
  // When new editor instance is created, update addons and hook service
  CodeMirror.defineInitHook(function (editor: Editor): void {
    updateService();
    for (const name in services) {
      const service: InnerService = services[name];
      if (!service.isLoad) {
        service.onLoad(cme);
      }
      service.onHook(editor, cme);
    }
  });
  return api;
}
