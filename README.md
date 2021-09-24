# TW5-CodeMirror-Enhanced

Implement a swift and rich extension framework for TiddlyWiki5's CodeMirror editor, including TiddlyWiki5 (`text/vnd.tiddlywiki`) syntax highlighting, Wiki link auto-completion, clickable links, Tiddler preview, and more. More features ( syntax tree, syntax completion , WYSIWYG mode , quick template input , etc. ) is under development . This framework is open source framework , anyone is welcome to join the development , the documentation is being written .

为 TiddlyWiki5 的 CodeMirror 编辑器实现一个灵活而丰富的扩展框架，包括 TiddlyWiki5(`text/vnd.tiddlywiki`)语法高亮、Wiki 链接自动补全、可点击链接、Tiddler 预览等功能。更多功能(语法树、语法补全、所见即所得模式、快捷模板输入等)正在开发中。本框架是开源框架，欢迎任何人加入开发，框架文档正在编写中。

[> English Readme <](https://github.com/Gk0Wk/TW5-CodeMirror-Enhanced/blob/main/README_en.md)

---

## 说明

本插件为 TiddlyWiki5 的 CodeMirror 编辑器提供了一个便于扩展的框架，原始项目[CodeMirror-Mode-TiddlyWiki5](https://github.com/Gk0Wk/CodeMirror-Mode-TiddlyWiki5)已停止开发。本框架继承原始项目的所有功能，并对整个框架进行重构，变成一个可扩展的模块化 CodeMirror 框架。目前支持的功能有：

- 对 TiddlyWiki5 语法高亮的支持，所有 MIME 类型留空或者为`text/vnd.tiddlywiki`的 tiddler 都会有高亮(效果见下文)。
- 支持像主流 IDE 那样在打字时实时进行代码补全的功能(**不需要**用<kbd>Ctrl</kbd>+<kbd>Space</kbd>激活)，并提供与 TiddlyWiki5 相关内容的补全，并提供丰富的扩展能力，此能力可以进行自定义扩展：
  - 目前支持在输入 WikiLink 时进行 tiddler 名称补全，以及同时提供 tiddler 内容预览(效果见下文)。
- 鼠标点击 url 或 WikiLink 会打开/跳转至对应的 网页/tiddler(效果见下文)，此能力可以进行自定义扩展。

插件还在开发中，如有任何建议或者 bug 请直接提 Issue。本框架欢迎所有人参与优化核心或者提交自己的插件。未来计划请见下文`TODO List`一节。

## 安装 & 编译

### 安装

<span style="color: red; font-weight: 900;">请首先安装最新版`CodeMirror`主插件和`CodeMirror Autocomplete`子插件(不然会报错)。</span>

如果你是单文件 TiddlyWiki5 用户或者`NodeJS`版 TiddlyWiki5 用户，直接去[Release](https://github.com/Gk0Wk/CodeMirror-Mode-TiddlyWiki5/releases)下载`TW5-CodeMirror-Enhanced-X.X.X.json`，然后将其拖拽到你的 TiddlyWiki 中，或者在 TiddlyWiki 中导入之。

如果插件报错了，不必惊慌，因为插件不会对 TiddlyWiki 本体内容做修改，所以只需要卸载就能够消除问题，但保险起见**还是建议先备份再安装**。

如果你使用的是`NodeJS`版本的 TiddlyWiki5 项目并希望将插件安装至项目，可以下载[Release](https://github.com/Gk0Wk/CodeMirror-Mode-TiddlyWiki5/releases)中的 `TW5-CodeMirror-Enhanced-X.X.X.zip` 文件，解压后放置到项目的 `plugins` 文件夹下，并在`tiddlywiki.info`文件中使用该插件。

### 编译

> 由于当前项目涉及 TypeScript 子项目的编译与打包，所以编译步骤较为繁琐，如你有更好的方案，欢迎提出意见！

首先安装`python3`，`node`与`npm`，并在项目根目录安装一些必要的包(yarn 同理)：

```shell
npm install uglify-js clean-css-cli rollup -g
npm install
```

随后进行编译工作，如果你有`Makefile`程序请直接运行：

```shell
make build
```

如果你没有`Makefile`或者不想安装，请运行：

```shell
cd src/core && rollup -c && cd ../..
python3 ./build.py
```

## 功能介绍

<details>
<summary>高亮TiddlyWiki5语法，支持内嵌代码块和LaTeX的语法高亮</summary>

Default:
![default](media/mode-default.jpg)

Ayu-Dark:
![ayu-dark](media/mode-ayu-dark.jpg)

TiddlyWiki:
![tiddlywiki](media/mode-tiddlywiki.jpg)

</details>

注意：这些主题有些是我自己装的，如感兴趣换主题，请阅读 TiddlyWiki 的 CodeMirror 的 README。

<details>
<summary>WikiLink实时补全提示+预览</summary>

![wikilink-hint](media/wikilink-hint.gif)

在预览打开的情况下：

![hint-preview](media/hint-preview.jpg)

</details>

<details>
<summary>可点击的链接</summary>

![wikilink-hint](media/clickable-link.gif)

- 对于 macOS 用户，<kbd>cmd</kbd> + <kbd>鼠标左键</kbd> 可以打开 tiddler 或者外部 url。
- 对于非 macOS 用户，<kbd>ctrl</kbd> + <kbd>鼠标左键</kbd> 可以打开 tiddler 或者外部 url。

</details>

其他功能正在开发中。

## 开发者

[Wiki(咕咕咕)](https://github.com/Gk0Wk/TW5-CodeMirror-Enhanced/wiki)

## 开发感想 & 致谢

在使用 TiddlyWiki 之后，一直苦于 TiddlyWiki5 语法没有高亮支持，写作体验不是很好。之前有也在网上找到一些相关的解决办法，例如在[Google Group](https://groups.google.com/g/tiddlywiki/c/c3y-PycRP4M)上面有人建议[用 TiddlyWiki2 的语法进行 Hack](https://www.gitmemory.com/issue/Jermolene/TiddlyWiki5/3685/770313436)，但是这种方法并不完美。

也有人编写了一个可用的 CodeMirror 的扩展版本[TW5-CodeMirror-Plus](https://github.com/adithya-badidey/TW5-codemirror-plus)，虽然是可用的，但是有两个问题：一个是语法高亮的内容有限，另一个是该插件直接基于 theme 而非 mode 进行开发，这就导致**如果想要用 TW5 的高亮就必须舍弃其他语法高亮，并且无法自定义主题**。所以最终还是打算自己写一个 :D

本插件一开始也是基于[TW5-CodeMirror-Plus](https://github.com/adithya-badidey/TW5-codemirror-plus)开发的，只不过魔改了很多，现在基本上是两个不同的插件了，在此感谢[TW5-CodeMirror-Plus](https://github.com/adithya-badidey/TW5-codemirror-plus)的作者[adithya-badidey](https://github.com/adithya-badidey)，以及`src/mode/tiddlywiki5.js`的原始作者[PMario](https://github.com/pmario)！

## TODO List

- [x] 代码块内的语法高亮与缩进。
- [x] LaTeX 公式高亮与缩进。
- [x] 自动补全内部链接的 tiddler 名称。
- [x] 可点击的 URL 与 WikiLink。
- [x] 补全提示的预览框。
- [ ] 编写 API 文档。
- [ ] 使用 `Lezer` 重新编写 TiddlyWiki5 的语法解析程序。
- [ ] 使用重写的语法解析程序重写语法高亮与缩进。
- [ ] 其他代码提示。
- [ ] 代码错误检查。
- [ ] 鼠标悬在 LaTeX 代码上方能够进行公式预览。
- [ ] 所见即所得编辑器。
