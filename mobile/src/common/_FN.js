import FN from './FN'
import anime from './anime'


function setCurrentClone(hid, clone) {
  let CCLONE = window.__currentClone__
  CCLONE[hid] = clone
  // 多级需要这样关联
  let item = FN.SETS(hid)
  if (item) {
    // console.log(item, hid)
    item.children.forEach(id => {
      if (!CCLONE[id] || (CCLONE[id] && !CCLONE[id].startsWith(clone))) {
        setCurrentClone(id, clone)
      }
    })
  }
}

function removeCurrentClone(hid) {
  delete window.__currentClone__[hid]
  
  let item = FN.SETS(hid)
  if (item) {
    item.children.forEach(id => {
      delete window.__currentClone__[id]
    })
  }
}

// 性能优化，批量计算情况，约100%性能提升
function finder(paths, data) {
  let p = data
  paths.forEach(e => {
      p = p[e]
  })
  return p
}

function getArrayDeepth(array) {
  if (!Array.isArray(array)) return 0

  function sum(arr, flag) {
    return arr.reduce(function(total, item) {
      var totalDeepth
      if (Array.isArray(item)) {
        totalDeepth = sum(item, flag + 1)
      }
      return totalDeepth > total ? totalDeepth : total
    }, flag)
  }
  return sum(array, 1)
}

/** 检查表达式
 * 1. $i 静态值 | 表达式
 * 2. $n 活动的索引 => 支持
 * 3. $even => 使用上不支持表达式
 * 4. $odd => 使用上不支持表达式
 * 5. ${正则} => 使用上不支持表达式
 * 6. 6.1 $model => 具体模型字段 => 支持   6.2 $model<Global>
 * 7. $N 任意数
 * 该函数 this 指向为 sets
 */
function subExpCheck(exps, v, I, hid) {
  try {
    let exp = exps[0]

    if (exps.length > 1) {
      exps.shift()
      return subExpCheck.bind(this)([exp], v, I, hid) || subExpCheck.bind(this)(exps, v, I, hid)
    }

    // TODO 需要检验状态命名不包含 : 和空白字符
    // 5. 正则单独占用一个表达式的位置，可以直接返回
    let rreg = exp.match(/^\${(.+)}$/)
    if (rreg) {
      return new RegExp(rreg[1]).test(v)
    }

    // odd even, 也是单独存在
    let calc = Number(v) % 2
    // 4.
    if (exp == '$odd') {
      return calc == 1
    }
    // 3.
    if (exp == '$even') {
      return calc != 1
    }
    // 7.
    if (exp == '$N') {
      return true
    }

    // 1. 数字的情况
    let nreg = exp.match(/\$\d+/g)
    if (nreg) {
      nreg.forEach(md => {
        exp = exp.replace(md, md.substr(1)) //因为必然是数字，进行替换即可
      })
    }

    // 2. 任意匹配，直接返回
    if (exp.includes('$n')) {
      if (!window.__currentClone__.hasOwnProperty(hid)) {
        return false
      }
      let curr = window.__currentClone__[hid].split('|')[I + 1]

      exp = exp.replace(/\$n/g, curr)
    }

    // 1. $i 表达式
    if (exp.includes('$i')) {
      exp = exp.replace(/\$i/g, v)
    }

    // 6. $xx 匹配非 null,进行替换, 非数字开头
    let modelReg = exp.match(/\$([a-zA-Z]\w+)<*(\w*)>*/g)
    if (modelReg) {
      modelReg.forEach(md => {
        let mdv = FN.parseModelExp(md, hid, true) || '0'
        let sreg = new RegExp('\\' + md, 'g')
        exp = exp.replace(sreg, mdv)

      })
    }

    // 2. 6. eval
    exp = eval(exp)

    // 情况 2,6 通过化简变成 1

    return typeof exp == 'boolean' ? exp : exp == v
  } catch (e) {
    warn('解析状态表达式错误:',e)
    return false
  }
}

// 类似于 this.GET，当应用不同，一个是根据 clone 定位数据，一个是全面筛选函数
// ei => exp index
function subExpFilter(exps, data, hid, ei = 0) {
  // 非数组则无需筛选
  if (!Array.isArray(data) || !exps.length) return data

  let exp = exps.shift()

  // 所绑定的模型数据可以粗略认为其数组结构映射着 clone
  // 加之为数据筛选器，那么理应由他作为参考标准
  let arr = data.filter((sub, I) => {
    return FN.subExpCheck(exp.split('&&'), I, ei, hid)
  })

  return arr.map(v => subExpFilter(exps, v, hid, ei + 1))
}

// handle 为parent对象
function subExpWrite(exps, data, hid, ei = 0, value, handle = null, hi = 0) {
  if (!Array.isArray(data) || !exps.length) {
    if (handle) {
      handle.splice(hi, 1, value)
    }

    return
  } 

  let exp = exps.shift()

  data.forEach((sub, I) => {
    // 如果检查通过，在下一层递归进行覆写
    if (FN.subExpCheck(exp.split('&&'), I, ei, hid)) {
      subExpWrite(exps, sub, hid, ei + 1, value, data, I)
    }
  })
}

function debounce(wait, fn, immediate = false) {
  let timeout

  return function() {
    let context = this
    let args = arguments

    if (timeout) clearTimeout(timeout)
    if (immediate) {
      let callNow = !timeout
      timeout = setTimeout(() => {
        timeout = null
      }, wait)
      if (callNow) fn.apply(context, args)
    } else {
      timeout = setTimeout(function() {
        fn.apply(context, args)
      }, wait)
    }
  }
}

function parseModelStr(target, hid) {
  if (typeof target != 'string' || target.slice(0, 1) != '$') {
    return target
  }
  // 这里不考虑 xxx<$current>的情况，基于性能考虑，后续考虑加上
  if (target == '$current') {
    return hid
  }
  let select = target.match(/\$(.+)<(.+)>/) // "$Bo<Global>" => "$Bo<Global>", "Bo", "Global"
  try {
    if (select) {
      target = FN.SETS(select[2]).model[select[1]].value
    } else {
      target = FN.SETS(hid).model[target.substr(1)].value
    }
    target = FN.parseModelStr(target, hid)
  } catch (e) {
    // 可能发生语法错误，或者死循环
    warn('解析模型字段错误：', e)
    target = ''
  }
  return target
}

// 适用于 单个表达式  ($model-2)($model-3)
function parseCTkey(str, hid) {
  if (typeof str != 'string') return str
  let lm = str.indexOf('($')
  let rm = str.indexOf(')')
  if (lm + 1 && rm > 0) {
    str = str.replace(str.substring(lm, rm + 1), parseModelStr(str.substring(lm + 1, rm), hid))

    // 如果为空直接返回
    if (!str) return ''

    if (str.includes('($') && str.includes(')')) {
      return parseCTkey(str, hid)
    }

    return str
  } else {
    return str
  }
}

function parseModelExp(exp, hid, runtime = true) {
  // 简单检查提升性能
  if (typeof exp != 'string' || !exp.includes('$')) return exp

  let list = exp.match(/\$\w+(-\w+)?(<.+?>)?/g) || []
  list.forEach(ms => {
    let V =  FN.parseModelStr(ms, hid)

    if (runtime) {
      V = typeof V == 'string' ? `'${V}'` : typeof V == 'object' ? JSON.stringify(V) : V
    }

    exp = exp.replace(new RegExp('\\' + ms, 'gm'), V)
  })
  return exp
}

const warn = console.warn
const log = console.log

window.warn = warn
window.log = log

const arrFirst = arr => (Array.isArray(arr) && arr.length < 2) ? FN.arrFirst(arr[0]) : arr
const tfClone = clone => clone.split('|').filter(v => v).map(v => '$' + v).join(':')

export default {
  setCurrentClone,
  removeCurrentClone,
  finder,
  subExpCheck,
  subExpFilter,
  subExpWrite,
  getArrayDeepth,
  debounce,
  parseCTkey,
  parseModelStr,
  parseModelExp,
  warn,
  log,
  anime,
  tfClone,
  arrFirst
}
