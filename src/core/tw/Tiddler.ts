export interface TiddlerField {
  [fieldName: string]: string | Date;
}

export interface Tiddler {
  cache: Record<string, unknown>;
  fields: TiddlerField;
}

export interface PluginInfo {
  tiddlers: Record<string, TiddlerField>;
}
