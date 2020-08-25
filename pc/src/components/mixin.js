import FN from '../common/FN'

function parseCTkey(str, hid) {
	let lm = str.indexOf('($')
	let rm = str.indexOf(')')
	if (lm + 1 && rm > 0) {
		return str.replace(str.substring(lm, rm + 1), FN.parseModelStr(str.substring(1, rm), hid))
	} else {
		return str
	}
}

// style 在这里成为存放class名的数组

// 系统变量命名： WORD_WORD  非系统：驼峰式

export default {
	props: {
		hid: {
			type: String
		},
		clone: {
			type: String,
			required: false,
			default: ''
		}
	},
	computed: {
		APP() {
			return this.$store.state.app
		},
		SETS() {
			return this.$store.state.sets
		},
		IT() {
			return this.SETS[this.hid]
		},
		MODEL() {
			if (!this.IT) return ''

			let { model } = this.SETS[this.hid]
			let values = {}
			Object.keys(model).forEach((key) => {
				values[key] = model[key].value
			})
			return values
		},
		CLASS() {
			if (!this.IT) return ''

			return this.AP.style.join(' ')
		},
		STYLE() {
			if (!this.SETS[this.hid]) return ''

			return this.AP.mixin
		},
		// active props
		AP() {
			let hid = this.hid
			let SETS = this.SETS
			let item = SETS[hid]
			let activeList = item.status.filter((state) => state.active)
			let clone = this.clone

			let metaState
			let metaName
			let activeFilterStates = []
			let filters = []

			// 将元状态和筛选器分组
			activeList.forEach((state) => {
				if (state.name.includes(':')) {
					activeFilterStates.push(state)
					filters.push(state.name)
				} else {
					metaState = state
					metaName = state.name
				}
			})

			let mixinList = []
			let calcProps = {}
			let mixinCustomKeys = [ {} ]
			let mixinStyles = []

			// 判断是否启动筛选
			/**
			 * map => clone |$|$  => state [stateName]:[exp]:[exp]
			 */
			let cloneArr = clone ? clone.split('|').slice(1) : [ '0' ] // |$|$ => [$, $]

			filters.forEach((filter, F) => {
				let nameArr = filter.split(':')
				let name = nameArr[0]

				// 去掉不是针对该元状态下的筛选器
				if (name != metaName) return

				let expArr = nameArr.slice(1) // exps => [exp, exp]

				if (expArr.length) {
					let curr
					let I
					let L = cloneArr.length
					let exp

					for (I = 0; I < L; I++) {
						curr = cloneArr[I]
						exp = expArr[I]

						if (exp) {
							// 判断 query 表达式 是否匹配，不匹配则中断循环
							// 将 this 指向 item 即 => this.SETS[hid]
							// curr => clone sub current
							if (!FN.subExpCheck.bind(item)(exp.split('&&'), curr, I, hid)) {
								return
							}
						} else {
							break
						}
					}

					// 1. 完全匹配  2. 或者泛匹配
					let validProps = activeFilterStates[F]
					mixinList.push(validProps)
					mixinCustomKeys.push(validProps.custom)
					mixinStyles.push(validProps.style)
				}
			})

			calcProps = mixinList[mixinList.length - 1] || metaState // hack: 如果无任何筛选，则不适用筛选
			//=========== 开始最终混合计算，得出最终 props =============
			let customKeys = Object.assign(...mixinCustomKeys, calcProps.custom || {})
			let style = [ ...mixinStyles, ...calcProps.style ]

			let mixin = {}

			// 解析 customKeys 内使用的表达式
			for (let ckey in customKeys) {
				mixin[ckey] = parseCTkey(customKeys[ckey], hid)
			}
			if (item.layout) {
				let layout = item.layout || {}

				for (let lk in layout) {
					mixin[lk] = layout[lk]
				}
			}

			return {
				style,
				mixin
			}
		}
	},
	methods: {
		INIT_MODEL() {},
		GET(key) {
			if (!this.IT) return ''

			let arr = FN.GET_MODEL(this.hid)(key, FN.tfClone(this.clone))

			let v = FN.parseModelExp(Array.isArray(arr) ? arr.toString() : arr, this.hid, false)

			if (v === 'false') v = false
			if (v === 'true') v = true

			return v
		},
		UPDATE(key, value) {
			FN.SET_MODEL(this.hid)(key, value, this.clone.split('|').filter((v) => v).map((v) => '$' + v).join(':'))
		},
		CID(hid, ...arg) {
			let item = this.SETS[hid]

			if (!item) return 0

			let cv = item.model.copy.value

			let p = cv //游标，赋值容错

			if (Array.isArray(cv)) {
				;[ ...arg ].forEach((v) => {
					p = cv[v]
				})

				return Number(p) || 0
			} else {
				return Number(cv) || 0
			}
		},
		CLONE(I) {
			return (this.clone || '') + this.COPY > 0 ? '|' + I : ''
		},
		// 如果要自定义 efn.name，则 id 需要传入
		EV(event, efn, id) {
			// 事件方法的装饰器，这里 this 指向 level 而不是 hid 元素本身
			let hid = id || efn.name.split('_').slice(1).join('_') // id的拼接规则如此
			let index = 0
			// 说明使用 custom handle 仅修饰，不运行
			if (typeof event == 'string') {
				let clone = event

				let dfn = (_, data) => {
					let el = document.querySelector(hid)
					event = {
						target: el,
						currentTarget: el,
						value: data
					}
					event.context = {
						clone,
						index,
						hid,
						event,
						response: null
					}
					event.hid = hid
					event.context.response = efn(event)
				}

				return dfn
			} else {
				let el = event.currentTarget
				let clone = el ? el.getAttribute('clone') : ''
				if (clone && clone.includes('|')) {
					FN.setCurrentClone(hid, clone)

					index = parseInt(clone.split('|').reverse()[0]) // 这里要保持数据类型一样为字符串
				} else {
				}

				event.context = {
					clone,
					index,
					hid,
					event,
					response: null
				}
				event.hid = hid
				// 这一步的输出决定下一步的输入
				event.context.response = efn(event)

				return event.context
			}
		},
		canRender() {
			let hid = this.hid
			let item = FN.SETS(hid)

			if (!item) {
				log('error::hid', hid)
				return false
			}

			// 无配置 render 的情况
			if (!item.model.render) return true

			let render = FN.GET_MODEL(hid)('render', FN.tfClone(this.clone))
			let flag = FN.arrFirst(render)

			if (typeof flag == 'string' && flag.substr(0, 1) == '$') {
				flag = FN.parseModelExp(flag, hid, false)
			}

			// false 的时候不渲染
			if (flag === true || flag === 'true') {
				return true
			}

			return false
		}
	}
}
