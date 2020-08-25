<template>
<div id="app">
  <transition v-bind:name="transitionType" v-on:before-enter="beforeEnter" v-on:before-leave="beforeLeave" v-on:after-leave="afterLeave">
    <!-- <keep-alive> -->
    <router-view />
    <!-- </keep-alive> -->
  </transition>
  <Global hid="Global" :clone="''"></Global>
</div>
</template>

<script>
import {
  mapState
} from 'vuex'
import FN from './common/FN'

import Global from './view/Global'

let T = 0

let cache

async function updatePage(pid, tree, sets, vm) {
  if (!sets[pid]) {
    for (let hid in tree) {
      vm.$set(sets, hid, tree[hid])
    }
  }
}

export default {
  name: 'app',
  data() {
    return {
      toward: 'right',
      transitionName: 'slide-left'
    }
  },
  components: {
    Global
  },
  computed: {
    transitionType() {
      let {
        transition
      } = this.history.current
      let type = transition

      switch (type) {
        case 'slide':
          type = type + '-' + this.toward
          break

        default:
          break
      }
      return type
    },
    ...mapState({
      app: state => state.app,
      sets: state => state.sets,
      pid: state => state.app.currentPage,
      history: state => state.history
    })
  },
  watch: {
    $route(to, from) {
      let {
        pid: tid
      } = to.meta
      let {
        pid: fid
      } = from.meta

      let {
        past,
        current,
        future
      } = this.history

      let time = history.state ? parseInt(history.state.key) : 0

      // TODO 当历史记录不为空的时候处理
      if (current.target != tid) {
        if (time > T) {
          this.goahead()
        } else {
          this.goback()
        }
      }

      T = time

      FN.PS.publish('routechange', {
        from: fid,
        to: tid
      })
    }
  },
  beforeCreate() {
    FN.PS.subscribe('updatePage', (msg, data) => {
      let {
        tree,
        pid
      } = data

      updatePage(pid, tree, this.SETS, this)

      this.APP.currentPage = pid
    })
  },
  methods: {
    beforeEnter(el) {
      el.style.transitionDuration = this.history.current.during + 'ms'
    },
    beforeLeave(el) {
      el.style.transitionDuration = this.history.current.during + 'ms'
    },
    afterLeave(el) {
      el.style.transitionDuration = ''
    },
    goback() {
      if (!this.history.past.length) return

      this.toward = 'left'
      this.history.future.push(this.history.current)

      let p = this.history.past.pop()

      this.$set(this.history, 'current', FN.cloneDeep(p))
    },
    goahead() {
      if (!this.history.future.length) return

      this.toward = 'right'
      this.history.past.push(this.history.current)

      let p = this.history.future.pop()

      this.$set(this.history, 'current', FN.cloneDeep(p))
    },
    getEL(hid) {
      return document.querySelector('[hid="' + hid + '"]')
    },
    getELS(hid) {
      return Array.from(document.querySelectorAll('[hid="' + hid + '"]'))
    },
    getCommonChild() {
      return this.SETS['Global'] ? ['Global'] : []
    }
  },
  mounted() {
    this.history.current.target = this.pid

    FN.PS.subscribe('Fx_router_change', (msg, data) => {
      log('Fx_router_change', data)

      this.toward = 'right'

      data.timestamp = new Date().getTime()

      this.history.past.push(this.history.current)
      this.$set(this.history, 'current', FN.cloneDeep(data))

      this.$router.push('/' + data.target)
    })

    const getActiveMetaState = (hid) => {
      let target = this.SETS[hid]

      if (!target) {
        warn(hid, 'target not find')
      }

      return target.status.filter(state => !state.name.includes(':') && state.active)[0]
    }

    const setTransition = (data, target, during, curve) => {
      let els = this.getELS(target)

      if (!els.length) {
        return warn(target, '元素不存在')
      }

      let record = []

      els.forEach((el, i) => {
        let {
          transitionDuration,
          transitionTimingFunction,
          transitionProperty
        } = el.style
        record[i] = {
          transitionDuration,
          transitionTimingFunction,
          transitionProperty
        }
        el.style.transitionDuration = during + 'ms'
        el.style.transitionTimingFunction = curve
        el.style.transitionProperty = 'all'
      })

      // 过期时间消除副作用
      setTimeout(() => {
        els.forEach((el, i) => {
          let {
            transitionDuration,
            transitionTimingFunction,
            transitionProperty
          } = record[i]
          el.style.transitionDuration = transitionDuration
          el.style.transitionTimingFunction = transitionTimingFunction
          el.style.transitionProperty = transitionProperty
        })

        data.next && data.next('done!')
      }, during)
    }

    const diffProps = (op, np) => {
      let obj = {}

      if (!op || !np) return obj

      for (let key in np) {
        // 旧对象不存在的key或者旧对象中key值有变化的计入
        if (!op.hasOwnProperty(key) || op[key] != np[key]) {
          obj[key] = np[key]
        }
      }

      return obj
    }

    const diffState = (os, ns) => {
      let ap = {} //animateProp
      let op = os.props
      let np = ns.props

      if (np.x != op.x) ap.left = np.x
      if (np.y != op.y) ap.top = np.y
      // if (np.d != op.d) ap.transform = 'rotate(' + np.d + 'deg)'
      if (np.d != op.d) ap.rotate = np.d

      if (np.option.V != op.option.V) ap.visibility = np.option.V ? 'visible' : 'hidden'

      let props = Object.assign(
        ap,
        diffProps(op.style, np.style),
        diffProps(op.option.customKeys, np.option.customKeys)
      )

      return props
    }

    const setAnime = (data, target, during, curve, oldState, newState) => {
      let els = this.getELS(target)

      if (!els.length) {
        return warn(target, '元素不存在')
      }

      let ap = {} //animateProp
      let op = oldState.props
      let np = newState.props

      if (np.x != op.x) ap.left = np.x
      if (np.y != op.y) ap.top = np.y
      // if (np.d != op.d) ap.transform = 'rotate(' + np.d + 'deg)'
      if (np.d != op.d) ap.rotate = np.d

      if (np.option.V != op.option.V) ap.visibility = np.option.V ? 'visible' : 'hidden'

      let props = Object.assign(
        ap,
        diffProps(op.style, np.style),
        diffProps(op.option.customKeys, np.option.customKeys), {
          duration: during,
          easing: curve,
        }
      )

      let ani = FN.anime({
        targets: els,
        ...props,
        complete: () => {
          // this.global.ignoreCalcStyle[target] = true
          oldState.active = false
          newState.active = true
          setTimeout(() => {
            // this.global.ignoreCalcStyle[target] = false
            data.next('statu done!')
          }, 0)
        }
      })

      log('ani', op.d, np.d, props)
    }

    FN.PS.subscribe('Fx_statu_change', (msg, data) => {
      let {
        hid,
        target,
        state,
        stateA,
        stateB,
        during,
        curve,
        loop,
        pushState
      } = data

      // $开头 需要转一下
      target = FN.parseModelStr(target, hid)

      let curr = this.SETS[target]

      let oldState
      let newState
      let index

      // 1. 状态切换
      if (state) {
        oldState = getActiveMetaState(target)

        newState = curr.status.filter(statu => statu.id == state)[0]
        // log('oldState::', oldState.id, 'newState::', newState.id)
      }

      // 2. 状态互切
      if (stateA && stateB) {
        let [A, B] = curr.status.filter(
          statu => statu.id == stateA || statu.id == stateB
        )

        if (A.active) {
          oldState = A
          newState = B
        } else {
          oldState = B
          newState = A
        }

        if (!A.active && !B.active) {
          // oldState = curr.status.filter(statu => statu.active)[0]
          oldState = getActiveMetaState(target)
          newState = A
        }
      }

      if (oldState) oldState.active = false
      if (newState) newState.active = true

      setTransition(data, target, during, curve)
    })

    FN.PS.subscribe('Fx_changeActive', (msg, data) => {
      let {
        hid,
        target,
        subState,
        during,
        curve,
        active
      } = data

      let realTarget = FN.parseModelStr(target, hid)

      setTransition(data, realTarget, during, curve)

      let curr = this.SETS[realTarget]

      if (subState) {
        let selected = curr.status.filter(statu => statu.id == subState)[0]

        if (selected) selected.active = active
      }
    })

    FN.PS.subscribe('Fx_animate', (msg, data) => {
      log('Fx_animate', data)

      let {
        hid,
        target,
        frames,
        during,
        delay,
        curve,
        loop
      } = data

      if (!frames.length) return
      // $开头 需要转一下
      target = FN.parseModelStr(target, hid)

      let curr = this.SETS[target]
      let currState = getActiveMetaState(target)
      // 编译版的在编译时进行生成，因此无需再次计算
      let els = this.getELS(target)

      if (!els.length) {
        return warn(target, '元素不存在')
      }
      // 应当放到 window上
      let ani = FN.anime({
        targets: els,
        keyframes: frames,
        duration: during,
        delay: FN.anime.stagger(delay), // 多个条目的话，使用间隔
        easing: curve,
        loop,
        complete: () => {
          warn('Fx_animate complete')
          data.next('animate done!')
        }
      })
      window.aniList[hid] = ani
    })

    FN.PS.subscribe('changeProject', (msg, data) => {
      window.location.reload()
    })
  }
}
</script>
