import cloneDeep from 'lodash.clonedeep'
import PubSub from 'pubsub-js'
import _FN from './_FN'
import FLOW from './updateData'

const getLocal = key => JSON.parse(localStorage.getItem(key) || '{}')
const saveLocal = (key, value) => localStorage.setItem(key, JSON.stringify(value))
const removeLocal = key => localStorage.removeItem(key)

const URL2Obj = u => (u ? Object.assign(...u.split('&').filter(e => e).map(e => ((a, b) => ({
  [a]: b
}))(...e.split('=')))) : {})

const Obj2URL = o => Object.keys(o).map(e => e + '=' + o[e]).join('&')

const getURLconfig = () => URL2Obj(location.hash.match(/([^\?]+)/g)[1])
const getURLparams = () => URL2Obj(location.search.slice(1))

function inject(src, tag = 'script', container = 'body') {
  let context = document.createElement(tag)
  context.id = 'i-' + new Date().getTime()
  if (tag === 'link') {
    context.href = src
    context.rel = 'stylesheet'
  } else {
    context.src = src
  }
  document.querySelectorAll(container)[0].appendChild(context)
  return new Promise((resolve, reject) => {
    context.onload = () => resolve(context)
  })
}

// FN.SETS('pageDefault')
const SETS = hid => window.__VM__.$store.state.sets[hid]
// FN.STATE('pageDefault')
const STATE = hid => SETS(hid).status.filter(state => state.active)[0]
// FN.GET_MODEL('levelDefault')('testModel', '$n')
const GET_MODEL = hid => (K, E = '$N') => {
  let target = SETS(hid)

  if (!target) {
    warn('target', hid, 'is null')
    return []
  }

  let model = target.model[K]

  if (!model) {
    // warn('model', K, 'is null')
    return []
  }
  return FN.subExpFilter(E.split(':'), model.value, hid)
}
// FN.SET_MODEL('pageDefault')('testModel', 2)
const SET_MODEL = hid => (K, V, E = '$N') => {
  let target = SETS(hid)
  let model = target.model[K]

  // 跳过筛选验证，直接写入
  if (E == 'force') {
    window.__VM__.$set(model, 'value', V)
  } else {
    if (Array.isArray(model.value)) {
      FN.subExpWrite(E.split(':'), model.value, hid, 0, V, model.value, 0)
    } else {
      window.__VM__.$set(model, 'value', V)
    }
  }

  FN.PS.publish(`${hid}.$${K}.modelchange`, V)
}



// FN.ROUTE_PUSH('pageDefault', 300, 'slide')
const ROUTE_PUSH = (target, during = 300, transition = 'fade') => {
  window.FN.PS.publish('Fx_router_change', {
    target,
    during,
    transition
  })
}

export default {
  ..._FN,
  getLocal,
  saveLocal,
  removeLocal,
  getURLconfig,
  getURLparams,
  cloneDeep,
  PS: PubSub,
  PS_ID: {},
  inject,
  SETS,
  STATE,
  SET_MODEL,
  GET_MODEL,
  ROUTE_PUSH,
  FLOW,
  toast: window.alert
}
