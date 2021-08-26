# CodeMirror-Mode-TiddlyWiki5

Adds Syntax Highlighting for TiddlyWiki5 tiddlers (`text/vnd.tiddlywiki`) to the CodeMirror, along with some other useful editor addon (wikilink hint, macro hint, etc.). Now is under development.

为TiddlyWiki的CodeMirror编辑器添加TiddlyWiki5(`text/vnd.tiddlywiki`)语法高亮，同时还有其他有用的编辑器插件(如Wiki链接自动提示、宏提示等)。现在正在开发中。

[> English Readme <](https://github.com/Gk0Wk/CodeMirror-Mode-TiddlyWiki5/blob/main/README_en.md)

---

[TOC]

## 插件说明

增加 [CodeMirror](http://codemirror.net) 对TiddlyWiki5语法高亮的支持，所有MIME类型留空或者为`text/vnd.tiddlywiki`的tiddler都会有高亮。同时支持像`VSCode`那样在打字时实时进行代码补全提示(目前仅实现了WikiLink补全)，且**不需要**用`Ctrl+Space`激活。

插件还在开发中，如有任何建议或者bug请直接提Issue。

## 安装&编译

<span style="color: red; font-weight: 900;">请首先安装最新版CodeMirror主插件和CodeMirror XML子插件(不然会报错)。</span>

直接去[Release](https://github.com/Gk0Wk/CodeMirror-Mode-TiddlyWiki5/releases)下载`CodeMirrorModeTiddlyWiki5-X.X.X.json`，然后将其拖拽到你的TiddlyWiki中，或者在TiddlyWiki中导入之。

如果插件报错了，不必惊慌，因为插件不会对TiddlyWiki本体内容做修改，所以只需要卸载就能够消除问题，但保险起见**还是建议先备份再安装**。

如果想DIY和编译，请直接运行`make`或者`make build`。请注意，被打包的是那几个`xxx.min.js`和`xxx.min.css`。

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

注意：这些主题有些是我自己装的，如感兴趣换主题，请阅读TiddlyWiki的CodeMirror的README。

<details>
<summary>WikiLink自动补全提示</summary>

![wikilink-hint](media/wikilink-hint.gif)

</details>

其他功能正在开发中。

## 开发感想

在使用TiddlyWiki之后，一直苦于TiddlyWiki5语法没有高亮支持，写作体验不是很好。之前有也在网上找到一些相关的解决办法，例如在[Google Group](https://groups.google.com/g/tiddlywiki/c/c3y-PycRP4M)上面有人建议[用TiddlyWiki2的语法进行Hack](https://www.gitmemory.com/issue/Jermolene/TiddlyWiki5/3685/770313436)，但是这种方法并不完美。

也有人编写了一个可用的CodeMirror的扩展版本[TW5-CodeMirror-Plus](https://github.com/adithya-badidey/TW5-codemirror-plus)，虽然是可用的，但是有两个问题：一个是语法高亮的内容有限，另一个是该插件直接基于theme而非mode进行开发，这就导致**如果想要用TW5的高亮就必须舍弃其他语法高亮，并且无法自定义主题**。所以最终还是打算自己写一个 :D

本插件一开始也是基于[TW5-CodeMirror-Plus](https://github.com/adithya-badidey/TW5-codemirror-plus)开发的，只不过魔改了很多，现在基本上是两个不同的插件了。

## TODO List

- [x] 代码块内的语法高亮与缩进。
- [x] LaTeX公式高亮与缩进。
- [x] 自动补全内部链接的tiddler名称。
- [ ] 其他代码提示。
- [ ] 代码错误检查。
- [ ] 鼠标悬在LaTeX代码上方能够进行公式预览。
