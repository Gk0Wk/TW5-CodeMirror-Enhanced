// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

/*
 * Author: Constantin Jucovschi (c.jucovschi@jacobs-university.de)
 * Licence: MIT
 */

(function (mod) {
  if (typeof exports === 'object' && typeof module === 'object')
    // CommonJS
    mod(require('$:/plugins/tiddlywiki/codemirror/lib/codemirror.js'));
  else if (typeof define === 'function' && define.amd)
    // AMD
    define(['$:/plugins/tiddlywiki/codemirror/lib/codemirror.js'], mod);
  // Plain browser env
  else mod(CodeMirror);
})(function (CodeMirror) {
  'use strict';

  CodeMirror.defineMode('tex', function (_config, parserConfig) {
    function pushCommand(state, command) {
      state.cmdState.push(command);
    }

    function peekCommand(state) {
      if (state.cmdState.length > 0) {
        return state.cmdState[state.cmdState.length - 1];
      } else {
        return null;
      }
    }

    function popCommand(state) {
      const plug = state.cmdState.pop();
      if (plug) {
        plug.closeBracket();
      }
    }

    // returns the non-default plugin closest to the end of the list
    function getMostPowerful(state) {
      const context = state.cmdState;
      for (let index = context.length - 1; index >= 0; index--) {
        const plug = context[index];
        if (plug.name == 'DEFAULT') {
          continue;
        }
        return plug;
      }
      return {
        styleIdentifier: function () {
          return null;
        },
      };
    }

    function addPluginPattern(pluginName, cmdStyle, styles) {
      return function () {
        this.name = pluginName;
        this.bracketNo = 0;
        this.style = cmdStyle;
        this.styles = styles;
        this.argument = null; // \begin and \end have arguments that follow. These are stored in the plugin

        this.styleIdentifier = function () {
          return this.styles[this.bracketNo - 1] || null;
        };
        this.openBracket = function () {
          this.bracketNo++;
          return 'bracket';
        };
        this.closeBracket = function () {};
      };
    }

    const plugins = {};

    plugins.importmodule = addPluginPattern('importmodule', 'tag', ['string', 'builtin']);
    plugins.documentclass = addPluginPattern('documentclass', 'tag', ['', 'atom']);
    plugins.usepackage = addPluginPattern('usepackage', 'tag', ['atom']);
    plugins.begin = addPluginPattern('begin', 'tag', ['atom']);
    plugins.end = addPluginPattern('end', 'tag', ['atom']);

    plugins.label = addPluginPattern('label', 'tag', ['atom']);
    plugins.ref = addPluginPattern('ref', 'tag', ['atom']);
    plugins.eqref = addPluginPattern('eqref', 'tag', ['atom']);
    plugins.cite = addPluginPattern('cite', 'tag', ['atom']);
    plugins.bibitem = addPluginPattern('bibitem', 'tag', ['atom']);
    plugins.Bibitem = addPluginPattern('Bibitem', 'tag', ['atom']);
    plugins.RBibitem = addPluginPattern('RBibitem', 'tag', ['atom']);

    plugins.DEFAULT = function () {
      this.name = 'DEFAULT';
      this.style = 'tag';

      this.styleIdentifier = this.openBracket = this.closeBracket = function () {};
    };

    function setState(state, f) {
      state.f = f;
    }

    // called when in a normal (no environment) context
    function normal(source, state) {
      let plug;
      // Do we look like '\command' ?  If so, attempt to apply the plugin 'command'
      if (/^\\[@A-Za-z]+/.test(source)) {
        const cmdName = source.current().slice(1);
        plug = plugins.hasOwnProperty(cmdName) ? plugins[cmdName] : plugins.DEFAULT;
        plug = new plug();
        pushCommand(state, plug);
        setState(state, beginParameters);
        return plug.style;
      }

      // escape characters
      if (/^\\[#$%&_{}]/.test(source)) {
        return 'tag';
      }

      // white space control characters
      if (/^\\[!,/;\\]/.test(source)) {
        return 'tag';
      }

      // find if we're starting various math modes
      if (source.match('\\[')) {
        setState(state, function (source, state) {
          return inMathMode(source, state, '\\]');
        });
        return 'keyword';
      }
      if (source.match('\\(')) {
        setState(state, function (source, state) {
          return inMathMode(source, state, '\\)');
        });
        return 'keyword';
      }
      if (source.match('$$')) {
        setState(state, function (source, state) {
          return inMathMode(source, state, '$$');
        });
        return 'keyword';
      }
      if (source.match('$')) {
        setState(state, function (source, state) {
          return inMathMode(source, state, '$');
        });
        return 'keyword';
      }

      const ch = source.next();
      if (ch == '%') {
        source.skipToEnd();
        return 'comment';
      } else if (ch == '}' || ch == ']') {
        plug = peekCommand(state);
        if (plug) {
          plug.closeBracket(ch);
          setState(state, beginParameters);
        } else {
          return 'error';
        }
        return 'bracket';
      } else if (ch == '{' || ch == '[') {
        plug = plugins.DEFAULT;
        plug = new plug();
        pushCommand(state, plug);
        return 'bracket';
      } else if (/\d/.test(ch)) {
        source.eatWhile(/[\w%.]/);
        return 'atom';
      } else {
        source.eatWhile(/[\w\-]/);
        plug = getMostPowerful(state);
        if (plug.name == 'begin') {
          plug.argument = source.current();
        }
        return plug.styleIdentifier();
      }
    }

    function inMathMode(source, state, endModeSeq) {
      if (source.eatSpace()) {
        return null;
      }
      if (endModeSeq && endModeSeq.test(source)) {
        setState(state, normal);
        return 'keyword';
      }
      if (/^\\[@A-Za-z]+/.test(source)) {
        return 'tag';
      }
      if (/^[A-Za-z]+/.test(source)) {
        return 'variable-2';
      }
      // escape characters
      if (/^\\[#$%&_{}]/.test(source)) {
        return 'tag';
      }
      // white space control characters
      if (/^\\[!,/;]/.test(source)) {
        return 'tag';
      }
      // special math-mode characters
      if (/^[&^_]/.test(source)) {
        return 'tag';
      }
      // non-special characters
      if (/^[!"#'*+,/:;<=>?@`|~\-]/.test(source)) {
        return null;
      }
      if (/^(\d+\.\d*|\d*\.\d+|\d+)/.test(source)) {
        return 'number';
      }
      const ch = source.next();
      if (ch == '{' || ch == '}' || ch == '[' || ch == ']' || ch == '(' || ch == ')') {
        return 'bracket';
      }

      if (ch == '%') {
        source.skipToEnd();
        return 'comment';
      }
      return 'error';
    }

    function beginParameters(source, state) {
      const ch = source.peek();
      let lastPlug;
      if (ch == '{' || ch == '[') {
        lastPlug = peekCommand(state);
        lastPlug.openBracket(ch);
        source.eat(ch);
        setState(state, normal);
        return 'bracket';
      }
      if (/[\t\r ]/.test(ch)) {
        source.eat(ch);
        return null;
      }
      setState(state, normal);
      popCommand(state);

      return normal(source, state);
    }

    return {
      startState: function () {
        const f = parserConfig.inMathMode
          ? function (source, state) {
              return inMathMode(source, state);
            }
          : normal;
        return {
          cmdState: [],
          f: f,
        };
      },
      copyState: function (s) {
        return {
          cmdState: [...s.cmdState],
          f: s.f,
        };
      },
      token: function (stream, state) {
        return state.f(stream, state);
      },
      blankLine: function (state) {
        state.f = normal;
        state.cmdState.length = 0;
      },
      lineComment: '%',
    };
  });

  CodeMirror.defineMIME('text/x-stex', 'tex');
  CodeMirror.defineMIME('text/x-latex', 'tex');
});
