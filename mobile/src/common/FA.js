import FN from './FN'

function alert(data, next) {
  window.alert(data)

  next(data)
}

function router(data, next) {
  let { during } = data

  FN.PS.publish('Fx_router_change', data)

  setTimeout(() => {
    next('router done!')
  }, during)
}

function statuToggle(data, next) {
   // warn('statuToggle')
  let { async, during } = data

  FN.PS.publish('Fx_statu_change', data)

  if (async) {
    next('statuToggle done!')
  } else {
    setTimeout(() => {
      next('statuToggle done!')
    }, during)
  }
}

function statu(data, next) {
  // warn('statu')
  FN.PS.publish('Fx_statu_change', data)

  let { async, during } = data

  if (async) {
    next('statu done!')
  } else {
    setTimeout(() => {
      next('statu done!')
    }, during)
  }
}

function activateStatu(data, next) {
  data.active = true

  FN.PS.publish('Fx_changeActive', data)

  let { async, during } = data

  if (async) {
    next('statu done!')
  } else {
    setTimeout(() => {
      next('statu done!')
    }, during)
  }
}

function frozenStatu(data, next) {
  data.active = false

  FN.PS.publish('Fx_changeActive', data)
  let { async, during } = data

  if (async) {
    next('statu done!')
  } else {
    setTimeout(() => {
      next('statu done!')
    }, during)
  }
}

function timeout(data, next) {
  setTimeout(() => {
    next('timeout done!')
  }, data)
}

function setModel(data, next) {
  let { target, key, exp, value } = data

  if (typeof target != 'string') return warn(target, '格式错误')
  if (typeof key != 'string') return warn(key, '格式错误')

  // log('setModel', data, key, value)
  // data.target, data.value
  FN.SET_MODEL(target)(key, value, exp.split(':').map(v => '$' + v).join(':'))

  next()
}

const arrFirst = arr => (Array.isArray(arr) && arr.length < 2) ? arrFirst(arr[0]) : arr

function getModel(data, next) {
  let { target, key, exp } = data

  if (typeof target != 'string') return warn(target, '格式错误')
  if (typeof key != 'string') return warn(key, '格式错误')

  // 新API，无历史兼容问题
  let arr = FN.GET_MODEL(target)(key, exp.split(':').map(v => '$' + v).join(':'))
  // 这里获得的是数组对象，因此最好加上一个配置，进行拍平，方便后面的程序处理
  // 先约定默认单/无元素数组，则直接取其数据
  arr = arrFirst(arr)

  next(arr)
}

function animate(data, next) {
  let { async, during } = data

  data.next = next

  window.FN.PS.publishSync('Fx_animate', data)

  if (async) {
    next('animate done!')
  } else {
  }
}

function animateCommand(data, next) {
  let { param } = data

  let ani = window.aniList[data.hid]

  if (ani) {
    ani[param]()
  }

  next('animateCommand done!')
}

function animateProgress(data, next) {
  let { param } = data

  let ani = window.aniList[data.hid]

  if (ani) {
    // ani.pause()
    ani.seek(Math.floor(param / 100 * ani.duration))
  }

  next('animateProgress done!')
}

function promisify(obj) {
  for (let key in obj) {
    let fn = obj[key]
    obj[key] = arg => new Promise((next, err) => {
      if (!fn) {
        return err(key + '不存在')
      }

      return fn(arg, next)
    })
  }
  return obj
}

async function exec(config) {
  let { actions } = config

  if (!config.hasOwnProperty('index')) {
    config.index = 0
  }

  let action = actions[config.index]

  // 越界判断
  if (action === undefined) return

  if (action) {
    let [ fn, args ] = action

    if (typeof args == 'object') {
      args.config = config
    }

    config.response = await fn(args)
  } else {
    // 跳过非激活的动作

    // 越界判断
    if (!(actions.length > config.index + 1)) return
  }

  config.index++

  exec(config)
}

export default {
  ...promisify({ 
    alert, router, timeout, 
    statu, statuToggle, activateStatu, frozenStatu,
    setModel, getModel,
    animate, animateCommand, animateProgress
  }),
  promisify,
  exec
}