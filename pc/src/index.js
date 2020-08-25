import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import mixin from './components/mixin'
import FN from './common/FN'
import UT from './common/UT'
import GV from './common/GV'

import './style/common.less'
import './components/index'

Vue.config.productionTip = false
Vue.mixin(mixin)

const VM = new Vue({
  router,
  store,
  render: h => h(App)
})

window.__VM__ = VM
window.FORM = {}
window.__currentClone__ = {}
window.aniList = {}
window.FN = FN
window.UT = UT
window.GV = GV

VM.$mount('#app')