# IFstruct-parser-web

IFstruct 转 web 工程源码的脚本工具

## 快速使用

1. 生成 web PC 端工程源码

```bash
npm run gen:pc
```

2. 生成 web 移动端工程源码

```bash
npm run gen:mobile
```

## 说明

IFstruct 可以通过该工具生成PC/移动端的 web 工程源码。在iofod或者其他编辑工具完成 IFstruct 编辑后，将其复制到该工程的`data/data.js`对应的位置上，接着选择对应UI框架下的模板压缩包，解压到根目录，根据需要修改模板，最后执行`data/gen.js [your template id]`即可让模板变成可用的工程代码。

## 备注

* 此项目处于 demo 阶段，仅建议掌握 web 开发技能的使用者在生产环境使用
* UI渲染框架目前仅支持 Vue，其他主流UI框架的parser将陆续推出

