# IFstruct-parser-web

A IFstruct's parser for web project.

[中文](/README_CN.md)

## Quick Start

1. generate web PC source code

```bash
npm run gen:pc
```

2. generate web-mobile source code

```bash
npm run gen:mobile
```

## Description

IFstruct generates web project source code for PC/Mobile with this tool. After editing IFstruct by iofod or other editing tools, copy it to the project's `data/data.js` location, then select the template package under the corresponding UI framework, unzip it to the root directory, modify the template as needed, and finally execute `data/gen.js [your template id]` Turning templates into usable project code.

## Remarks

* This project is in the demo phase and is only recommended for users with web development skills to use in a production environment.
* The UI rendering framework currently only supports Vue, parser for other major UI frameworks will be coming soon.
