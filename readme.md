# StarUML 中文汉化版语言翻译包

## 介绍

对官方版 StarUML 程序 by [staruml.io](https://staruml.io/) ，进行了部分汉化。

可自行在本地修改翻译文本，该项目所有数据与执行脚本均为明文开源，汉化脚本没有对程序做其他修改，仅做了部分文本的翻译。

如有汉化补充或错误修正，你可以在该库提交MR。关于 StarUML 或 UML 的使用心得大家也可以在这儿一起讨论 :-）

![截图](./shot1.png)

## 如何使用

### 1. 安装node.js运行环境

[NodeJS 下载地址](https://nodejs.org/) 


请确保命令行中能成功执行  ```node -v```

### 2. 下载该汉化脚本的zip包

将包中的各文件解压到 starUML 的安装目录中的 ```resources``` 目录中，要与目录中的 ```app.asar``` 文件平级。

	包含3个主要文件：

	* langPackage.json
	* package.json
	* warp.js

### 3. 执行汉化脚本

```cd``` 到程序的安装目录 ```~/starUML/resources``` 下，执行 ```npm start``` 命令行。

看见提示  “```安装中文包完成。```”，则汉化完成，直接运行 starUML 程序开始使用就是中文界面了。

## 说明

文件 ```langPackage.json``` 即为翻译用的文本对照包，可自行对其中各项的 "lang" 字段进行修改，实现自定义翻译，执行脚本后生效。

```"language-immerse": true```, 字段值改为 ```false``` 可实现双语界面。

## 感谢 StarUML 

汉化包内容，任何人均可随意使用