const fs = require('fs')
const path = require('path')
let { data } = require('./data')
const { genPageContent, genRouteContent, genStoreContent, genViewContent, genScriptDeps } = require('./temp')
const { genRootTreeStyle, genTreeStyle, genSingleStyleContent } = require('./buildStyle')
const prettier = require("prettier")

const parser = {
  'js': 'babel',
  'vue': 'vue'
}
function format(content, type = 'js') {
  // return content
  return prettier.format(content, { semi: false, parser: parser[type] || type })
}


let { appid, CTT, Models, Config } = data
let { pages, HSS } = CTT.T
let { table, Fx, MF, util } = Models
let unit
let getPath

const mkdir = road => {
  return new Promise(done => {
    fs.mkdir(getPath(road), { recursive: true }, (err) => {
      if (err) {
        console.log(err)
        done(err)
      }
      done()
    })
  })
}


let utilStyleContent
let styleMap


function getLayout(tag = 'default|1200') {
  let [_, L] = tag.split('|')
  // 左右分栏
  if (tag.includes('pclr')) {
    return {
      width: 'calc(100% - ' + L + 'px)',
      'margin-left': L + 'px'
    }
  } else if (tag.includes('fone')) {
  // 单栏铺满
    return {
      width: '100%',
      'min-width': L + 'px'
    }
  } else {
    // 居中布局
    return {
      width: L + 'px'
    }
  }
}

function transformSets(hid, sets) {
  let target = {}
  let { status, model, type, layout, children } = sets
  // layout 需要静态化，不提供编辑

  target.model = {}

  for (let key in model) {
    let { value, subscribe } = model[key]

    target.model[key] = {
      value, use: subscribe
    }
  }

  if (layout) {
    target.layout = getLayout(layout)
  }

  // 如果有多级关联的需要，通过这种形式可以快速获得结果，而不需要经过 dom 元素来获取
  target.children = children

  target.status = status.map((statu, I) => {
    let { name, id, active, props } = statu
    let { customKeys } = props.option

    let custom = customKeys || {}

    let smap = styleMap[hid + '|' + I] || []

    if (!smap) {
      console.log(smap, hid, styleMap)
    }

    return {
      name,
      id: id || 'default',
      active,
      custom,
      style: [
        // type,
        hid + '_' + I,
        ...smap
      ]
    }
  })

  return target
}

function genetateSets(hid, tree = {}, useTransform = true) {
  let target 
  try {
    target = JSON.parse(JSON.stringify(HSS[hid]))
  } catch (e) {
    console.log(e, hid, HSS[hid])
  }

  tree[hid] = useTransform ? transformSets(hid, target) : target

  if (target && target.children && target.children.length) {
    target.children.forEach(id => {
      genetateSets(id, tree, useTransform)
    })
  }

  return tree
}

function genPages() {
  pages.forEach(pid => {
    let tree = HSS[pid]

    let levels = []
    let levelTag = []
    let levelTagName = []
    let levelImport = []

    tree.children.forEach(hid => {
      let tag = `V${hid}`

      levels.push(hid)
      levelTagName.push(tag)
      levelTag.push(`<!-- ${HSS[hid].name} -->`, `<${tag} hid="${hid}" :clone="''"></${tag}>`)
      levelImport.push(`import ${tag} from '../view/${hid}'`)

      genView(hid)
    })

    let subTree = genetateSets(pid)
    let content = genPageContent(pid, levelTagName, levelTag, levelImport, subTree)

    let road = getPath('pages/' + pid + '.vue')

    fs.writeFileSync(road, format(content, 'vue'))
  })
}

function genRoutes() {
  let road = getPath('router/index.js')

  let content = genRouteContent(pages.map(pid => {
    let tree = HSS[pid]
    // historyPath 为线上环境访问路径，若无则默认使用 pid
    // router push的时候，读取路由 name 属性

    return `{
      path: '/${tree.historyPath || pid}',
      name: '${pid}',
      meta: { title: '${tree.name}', pid: '${pid}' },
      component: () => import('../pages/${pid}')
    }`
  }))

  fs.writeFileSync(road, format(content, 'js'))
}

function genStore() {
  let road = getPath('store/tree.js')

  let subTree = genetateSets('Global')

  genView('Global')

  let content = genStoreContent(appid, subTree)

  fs.writeFileSync(road, format(content, 'js'))
}

function genStyle() {
  let utilRoad = getPath('style/style.util.less')

  fs.writeFileSync(utilRoad, utilStyleContent)

  pages.forEach(pid => {
    let road = getPath('style/page/' + pid + '.css')


    let content = genSingleStyleContent(genTreeStyle(genetateSets(pid, {}, false), unit).idStyle)

    fs.writeFileSync(road, content)
  })

  let groad = getPath('style/Global.less')
  let gcontent = genSingleStyleContent(genTreeStyle(genetateSets('Global', {}, false), unit).idStyle)

  fs.writeFileSync(groad, gcontent)
}

const Diff = require('universal-diff')

function mergeDiff(value, diff) {
  diff = diff || []

  // 单个
  value = Diff.mergeStr(value, {
    splitter: "",
    diff: diff
  })

  return value
}

async function genJS(prefix, id, dict, useWindow = false) {
  let { key, value, dir } = dict[id]
  let diff = dict[id]['△']

  value = mergeDiff(value, diff)

  // 文件名以 id 为准
  let road

  if (dir) {
    let fdir = 'common/' + prefix + dir + '/'

    road = getPath('common/' + prefix + dir + '/' + key + '.js')

    await mkdir(fdir)
  }
   else {
    road = getPath('common/' + prefix + '/' + key + '.js')
  }

  let content

  if (useWindow) {
    content = `//${key}\n\export default async function(data) {\n${value}\n}`
  } else {
    content = `//${key}\n\export default async function(data, next) {\n${value}\n}`
  }

  
  fs.writeFileSync(road, format(content, 'js'))
}

function genScript() {
  // table, Fx, MF, util 
  Object.keys(Fx).forEach(id => genJS('fx', id, Fx))
  Object.keys(MF).forEach(id => genJS('mf', id, MF))
  Object.keys(util).forEach(id => genJS('util', id, util, true))

  let fxRoad = getPath('common/FX.js')
  let fxContent = genScriptDeps('fx', Object.keys(Fx), Fx, 'FX')

  let mfRoad = getPath('common/MF.js')
  let mfContent = genScriptDeps('mf', Object.keys(MF), MF, 'MF')

  let utRoad = getPath('common/UT.js')
  let utContent = genScriptDeps('util', Object.keys(util), util, 'UT', true)

  fs.writeFileSync(fxRoad, format(fxContent, 'js'))
  fs.writeFileSync(mfRoad, format(mfContent, 'js'))
  fs.writeFileSync(utRoad, format(utContent, 'js'))
}

function genView(lid) {
  let road = getPath('view/' + lid + '.vue')

  let tree = genetateSets(lid, {}, false)
  let gtree = genetateSets('Global', {}, false)

  let content = genViewContent(lid, {
    ...gtree,
    ...tree
  })

  fs.writeFileSync(road, format(content, 'vue'))
}

function setGenType(type) {
  switch (type) {
    case 'phone':
      unit = 'rem'
      getPath = road => path.resolve('../mobile/src/' + road)
      break
    case 'pc':
      unit = 'px'
      getPath = road => path.resolve('../pc/src/' + road)
      break
  
    default:
      break
  }
}
console.time('gen')
async function main() {
  let args = process.argv.splice(2)
  setGenType(args[0] || 'pc')

  console.log('planform:', args)

  let genedStyle = genRootTreeStyle(HSS, unit)

  utilStyleContent = genedStyle.utilStyleContent
  styleMap = genedStyle.styleMap

  genPages()
  genRoutes()
  genStore()
  genStyle()
  genScript()
  
  console.timeEnd('gen')
  console.log('gen Done!')
}

main()