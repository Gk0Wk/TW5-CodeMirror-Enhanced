import CodeMirror, { StringStream, Mode, EditorConfiguration } from 'codemirror';
import { ParseRule } from './parserules/rules';
import 'codemirror/mode/meta';

// Duff's device algorithm (ordered)
export function arrayEach<T = unknown>(array: T[], callback: (item: T, index: number, array: T[]) => boolean): void {
  const length: number = array.length;
  const blocks: number = Math.trunc(length * 0.125);
  let f: number;
  let next: boolean;
  if (blocks > 0) {
    let n = 0;
    do {
      f = n++ << 3;
      next =
        !callback(array[f], f, array) ||
        !callback(array[f + 1], f, array) ||
        !callback(array[f + 2], f, array) ||
        !callback(array[f + 3], f, array) ||
        !callback(array[f + 4], f, array) ||
        !callback(array[f + 5], f, array) ||
        !callback(array[f + 6], f, array) ||
        !callback(array[f + 7], f, array);
      if (next) {
        return;
      }
    } while (n < blocks); // n must be greater than 0 here also
  }
  f = length % 8;
  if (f > 0) {
    do {
      next = callback(array[length - f], length - f, array);
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    } while (--f && next); // n must be greater than 0 here
  }
}

export function recordEach<T = unknown>(object: Record<string, T>, callback: (value: T, key: string, object: Record<string, T>) => boolean): void {
  const keys: string[] = Object.keys(object);
  const length: number = keys.length;
  let index = 0;
  for (; index < length; index++) {
    if (!callback(object[keys[index]], keys[index], object)) break;
  }
}

export function matchRule(rules: ParseRule[], stream: StringStream): ParseRule | undefined {
  let answer: ParseRule | undefined;
  arrayEach<ParseRule>(rules, (rule) => {
    if (typeof rule.test === 'function') {
      if (rule.test(stream, false) === stream.pos) {
        answer = rule;
        return false;
      }
      return true;
    } else if (typeof rule.test === 'string') {
      if (stream.string.indexOf(rule.test, stream.pos) === stream.pos) {
        answer = rule;
        return false;
      }
      return true;
    } else {
      rule.test.lastIndex = stream.pos;
      const result = rule.test.exec(stream.string);
      if (result !== null && result.index === stream.pos) {
        answer = rule;
        return false;
      }
      return true;
    }
  });
  return answer;
}

export function findNearestRule(rules: ParseRule[], stream: StringStream): [ParseRule, number] | undefined {
  let answer: ParseRule | undefined;
  let nearest = stream.string.length;
  arrayEach<ParseRule>(rules, (rule) => {
    if (typeof rule.test === 'function') {
      const index = rule.test(stream, true);
      if (index >= stream.pos && index < nearest) {
        answer = rule;
        nearest = index;
        return nearest !== stream.pos;
      }
      return true;
    } else if (typeof rule.test === 'string') {
      const index = stream.string.indexOf(rule.test, stream.pos);
      if (index >= stream.pos && index < nearest) {
        answer = rule;
        nearest = index;
        return nearest !== stream.pos;
      }
      return true;
    } else {
      rule.test.lastIndex = stream.pos;
      const result = rule.test.exec(stream.string);
      if (result !== null && result.index < nearest) {
        answer = rule;
        nearest = result.index;
        return nearest !== stream.pos;
      }
      return true;
    }
  });
  return answer === undefined ? undefined : [answer, nearest];
}

export function getMode(name: string, cmCfg: EditorConfiguration): Mode<unknown> | undefined {
  if (typeof CodeMirror.findModeByName === 'function') {
    const found = CodeMirror.findModeByName(name);
    if (found !== undefined) name = found.mime ?? found.mimes?.[0] ?? name;
  }
  const mode_ = CodeMirror.getMode(cmCfg, name);
  return mode_.name === 'null' ? undefined : mode_;
}
