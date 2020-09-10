const { data } = require('./data')
const { HSS } = data.CTT.T
let { table: TB, Fx: FX, MF, util: UT } = data.Models
let { mainPage } = data.Config.setting

function replaceDot(str) {
	/*
	let match = str.match(/\".*?\"\:/gm) // 替换属性的 ""

	match.map((v) => v.substr(1, v.length - 3)).forEach((v, i) => {
		// if (!match[i].includes('-') && !match[i].match(/^\d/)) {
		//   str = str.replace(match[i], v + ':')
		// }
		// console.log(match[i].substr(1, 1))
		if (match[i].includes('-')) {
		} else if (match[i].substr(1, 1).match(/^\d/)) {
		} else {
			str = str.replace(match[i], v + ':')
		}
	})
	*/

	// prettier会自动格式化，所以这里不用
	return str

}

String.prototype.replaceAll = function (s1, s2) {
  return this.replace(new RegExp(s1, "gm"), s2)
}

function genArray(num) {
	return Array(num).fill(0)
}

// 循环维度映射，L 是 level 专属，之后进行递增，理论上可以递增到 Z，但实际应用其实是  I J K，基本不会再深入了
const DIMap = {
	0: '',
	1: 'I',
	2: 'J',
	3: 'K',
	4: 'L',
	5: 'M',
	6: 'N',
	7: 'O',
	8: 'P',
	9: 'Q',
	10: 'R',
	11: 'S'
	// 目前支持到10维的数据绑定，更多维后续如果有用户反馈再添加
}

function getCloneMark(DI) {
	return genArray(DI).map((_, I) => DIMap[I + 1]) // DI=3 =>  [I, J, K]
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

	let props = Object.assign(ap, diffProps(op.style, np.style), diffProps(op.option.customKeys, np.option.customKeys))

	return props
}

const getActiveMetaState = (hid) => {
	let target = HSS[hid]

	return target.status.filter((state) => !state.name.includes(':') && state.active)[0]
}

// 对特定的模型变量不进行转换
const parseExclude = ['$response', '$N', '$odd', '$even', '$n']

const expStringify = (params, hid) => {
	for (let attr in params) {
		let value = params[attr]

		if (typeof value == 'string' && value != '$current' && value.slice(0, 1) === '$' && parseExclude.filter(v => value.includes(v)).length<1) {
			console.log('now parse.....', value)
			params[attr] = `__R__FN.parseModelStr('${value}', e.hid)__R__`
		}
	}
	return replaceDot(JSON.stringify(params, null, 2)
	.replace(/\$current/g, hid)
		.split('\n').join('\n\t\t\t'))
		.replace('"__R__', '')
		.replace('__R__"', '') // 替换掉填充字
}

function getExec(fn, params, param, hid) {
	let fnexec
	let fnargs

	switch (fn) {
		case 'function':
			if (param) {
				let { key, dir = '' } = FX[param]
				let road = dir.split('/').join('.')

				fnexec = `FX${road}.${key}`
				fnargs = `e.context` // 函数或者服务需要透传对应的参数
			}
			break
		case 'service':
			if (param) {
				let { key, dir } = MF[param]
				let road = dir.split('/').join('.')

				fnexec = `MF${road}.${key}`
				fnargs = `e.context`
			}
			break
		case 'alert':
			fnexec = `FA.alert`
			fnargs = `${param}`
			break
		case 'timeout':
			fnexec = `FA.timeout`
			fnargs = `${param}`
			break
			
		case 'animate':
			fnexec = `FA.animate`

			let curr = HSS[hid]
			let currState = getActiveMetaState(hid)

			params.frames = params.frames.map((id) => {
				let state = curr.status.filter((statu) => statu.id === id)[0]
				let changed = diffState(currState, state)

				currState = state

				return changed
			})

			// console.log('params.frames', params.frames)

			let args = expStringify(params, hid)
			fnargs = `${args}`

			break
		default:
			if (params) {
				let args = expStringify(params, hid)

				fnexec = `FA.${fn}`
				fnargs = `${args}`
			}
			// todo 处理 while assert ended 等逻辑
			break
	}

	// 先进行表达式的替换
	fnargs = fnargs.replace(/: "(.*?)\$response(.*?)"/g, ': $1response$2')
	
	// 对中间过程中的 res 进行全局替换
	fnargs = fnargs.replace(/"\$response"/g, 'response')

	return {
		fnexec,
		fnargs
	}
}

function genExp(exp, hid) {
	let expList = exp.match(/\$\w+(-\w+)?(<.+?>)?/g) || []

	expList.forEach((mds) => {
		// 表达式里的 $response 则直接使用变量
		if (mds == '$response') {
			exp = exp.replace(new RegExp('\\' + mds, 'gm'), `${mds.substr(1)}`)
		} else {
			exp = exp.replace(new RegExp('\\' + mds, 'gm'), `FN.parseModelStr('${mds}', e.hid)`)
		}
	})

	return exp
}

let useCommand = false
const useCommandList = [] //历史记录

const writeResponseList = ['function', 'service'] // 用于处理内置response

function genActionList(hid, actions, list = []) {
	let actionArr = actions.filter(action => action.active)
	actionArr.forEach((action, I) => {
		let { fn, active, params, param } = action

		if (!active) return

		if (fn == 'assert') {
			let { exp, O, X } = action

			exp = genExp(exp, hid)

			let tmp = `
      if (${exp}) {
        ${genActionList(hid, O, []).join('\n')}
      } else {
        ${genActionList(hid, X, []).join('\n')}
      }
      `

			list.push(tmp)
		} else if (fn == 'loopAssert') {
			// while
			let { exp, O } = action

			exp = genExp(exp, hid)

			useCommandList.push(useCommand)
			useCommand = true

			let tmp = `
      let mark = await whileAsync(() => (${exp}), async(command) => {
        ${genActionList(hid, O, []).join('\n')}
      })

      if (mark == 'RETURN') return
      `

			list.push(tmp)

			useCommand = useCommandList.pop()
		} else if (fn == 'ended') {
			// break|continue|return
			let tmp

			if (useCommand) {
				tmp = `
        return command('${param.toUpperCase()}')
        `
			} else {
				tmp = `return '${param.toUpperCase()}'`
			}

			list.push(tmp)

			return //无论何种指令，终止符都会终止当前执行列表的执行
		} else {
			let { fnexec, fnargs } = getExec(fn, params, param, hid)

			if (fn == 'getModel') {
				let fragment = `await ` + fnexec + `(` + fnargs + `)`
				let nextAction = actionArr[I + 1]
				// 下一步动作是 function/service则需要写入 e.context
				if (nextAction) {
					fragment = 'response = ' + fragment
					if (writeResponseList.includes(nextAction.fn)) {
						fragment += '\ne.context.response = response'
					}
				}

				list.push(fragment)
			} else if (writeResponseList.includes(fn)) {
				let fragment = `await ` + fnexec + `(` + fnargs + `)`
				let nextAction = actionArr[I + 1]

				if (nextAction && JSON.stringify(nextAction).includes('$response') && !writeResponseList.includes(nextAction.fn)) {
					fragment = 'response = ' + fragment
				}

				list.push(fragment)
			} else {
				list.push(`await ` + fnexec + `(` + fnargs + `)`)
			}
		}
	})
	return list
}

let customEvent = ['routechange', 'modelchange']

let CE_list = [] // 处理非原生事件

// modelchange 放到 created 里
// routechange 放到 level watch里 or FN.PS Fx_change_router
function genEventContent(hid, events, jumpCE = true) {
	let eventMarks = []
	let eventMethods = []

	events.forEach((evo) => {
		if (jumpCE && customEvent.includes(evo.event)) {
			evo.hid = hid
			CE_list.push(evo)
			return
		}

		// 如果 evo 携带 hid，则优先，因为此时的 evo来源于 CE_list
		hid = evo.hid || hid

		let { event, actions, native, select } = evo

		let prefix = `@${event}${native ? '.native' : ''}`

		if (select.length) {
			prefix += '.' + select.join('.')
		}

		let methodName = `${event}_${hid}`

		eventMarks.push(`${prefix}="EV($event, ${methodName})"`)

		// 排练的非排练分开处理

		let useRehearsal = actions.filter((o) => o.fn == 'rehearsal').length > 0

		let execBody = []

		if (useRehearsal) {
			let actionList = []

			actions.forEach((action) => {
				let { fn, active, params, param } = action

				if (active) {
					let { fnexec, fnargs } = getExec(fn, params, param, hid)
					actionList.push(`[${fnexec}, ${fnargs}]`)
				} else {
					actionList.push(0)
				}
			})

			let exec = `let actions = [${actionList.join(', ')}]

      await FA.exec({
        actions
      })`

			execBody.push(exec)
		} else {
			execBody = genActionList(hid, actions)
		}
		let acStr = JSON.stringify(actions)
		let use$Response = acStr.includes('$response') || acStr.includes('function') || acStr.includes('service')

		let methodBody = `async ${methodName}(e) {
      ${use$Response ? 'let response\n' : ''}${execBody.join('\n')}
    }`

		eventMethods.push(methodBody)
	})

	return {
		eventMarks,
		eventMethods
		/**
     * eventMarks: [@click.native="click_xccc", @touchstart.native="touchstart_xxx"]
     * eventMethods: [async xxx() {}, async xxx() {}]
     * 
     */
	}
}

exports.genPageContent = (pid, levels, levelTag, levelImport, tree) => {
	return `
<template>
  <div class="page">
    ${levelTag.join('\n\t\t')}
  </div>
</template>

<script>
import FN from '../common/FN'
${levelImport.join('\n')}
import '../style/page/${pid}.css'

FN.PS.publish('updatePage', { tree: ${replaceDot(JSON.stringify(tree, null, 2))}, pid: "${pid}"})

export default {
  components: {
    ${levels.join(',\n\t\t')}
  }
}
</script>`
}

exports.genRouteContent = (routes) => {


	return `
import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
		${routes.join(',\n\t\t')},
    { path: '/', redirect: '/${mainPage}' }
  ]
})`
}

exports.genStoreContent = (appid, tree) => {
	let str = JSON.stringify(
		Object.assign(
			{
				padding: {
					status: [
						{
							name: 'default',
							id: 'default',
							style: [],
							custom: {},
							active: true
						}
					],
					model: {}
				}
			},
			tree
		),
		null,
		2
	)
		.split('\n')
		.join('\n')

	str = replaceDot(str) // 格式化缩进

	let model = {}

	for (let mid in TB) {
		let obj = TB[mid]
		model[obj.key] = {
			id: mid,
			subscriber: obj.subscriber
		}
	}

	// let mstr = replaceDot(JSON.stringify(model, null, 2)) => prettier会自动格式化，所以这里不用
	let mstr = JSON.stringify(model, null, 2)

	return `
export default {
  state: {
    app: {
      appid: '${appid}',
      currentPage: null,
    },
    sets: ${str},
    // 保存页面过渡状态
    history: {
      past: [],
      current: {
        target: '',
        during: 500,
        transition: 'fade',
        timestamp: 0
      },
      future: []
		},
		models: ${mstr}
  },
}
`
}

exports.genViewContent = (lid, tree) => {
	let eventContent = []
	// hid 目标id, IN indent, DI, clone 维度
	const genChildView = (hid, IN = '', DI = 0) => {
		let target = tree[hid]

		let { content, type, model, events, name, remarks } = target

		let [ ui, cname ] = content.split('/')
		let getTag

		// 内置系统UI的别名
		if (ui == 'base') {
			ui = 'IF'
		} else {
			// 如果不是基础组件，则不添加lib前缀，因为本身要求是自带的
			ui = ''
		}

		let hasCopy = false

		if (model.hasOwnProperty('copy')) {
			hasCopy = true
			DI += 1 // 维度加 1
		} else {
			hasCopy = false
		}

		let LM = DIMap[DI] // loop mark
		let CM_arr = getCloneMark(DI)
		let CM = CM_arr.join(" + '|' + ")

		CM = DI > 0 ? "'|' + " + CM : "''" //   clone=""  clone="|I|J"   clone mark =>  '|' + [I, J].join('|') => |I|J

		let str
		let isMirror = content == 'base/mirror'

		let cloneMark = CM != "''" ? ` :clone="${CM}"` : ``

		const tag = `${ui}${cname}`

		let { eventMarks, eventMethods } = genEventContent(hid, events)

		eventContent.push(...eventMethods)

		const EBD = eventMarks.length > 0 ? ' ' + eventMarks.join(' ') : '' //eventBinding

		let CID = DI > 1 ? `'${hid + "', " + CM_arr.slice(0, CM_arr.length - 1).join(', ')}` : `'${hid}'` // copy 比普通的 model 小一个维度，所以这里判定条件为 1

		if (type == 'unit' && !isMirror) {
			let unitHead = `${IN}\t<${tag} class="U-unit" hid="${hid}"${EBD}`

			if (hasCopy) {
				str = `${unitHead} v-for="(_, ${LM}) in CID(${CID})" :key="'${hid}' + ${CM}"${cloneMark}></${tag}>`
			} else {
				str = `${unitHead}${cloneMark}></${tag}>`
			}
		} else {
			// container or mirror
			IN += '\t'

			// 源码编译版本，mirror需要进行静态化，不允许修改或者使用变量
			let inject = isMirror ? ' class="U-unit"' : ''

			let wrapHead = `${IN}<${tag}${inject} hid="${hid}"${EBD}`

			// copy 使用的是循环模板
			if (hasCopy) {
				getTag = (v) => `${wrapHead} v-for="(_, ${LM}) in CID(${CID})" :key="'${hid}' + ${CM}"${cloneMark}>${v}</${tag}>`
			} else {
				getTag = (v) => `${wrapHead}${cloneMark}>${v}</${tag}>`
			}

			if (isMirror) {
				// mirror 编译时只支持零维值，所以不用考虑多维度情况
				let uv = target.model.use.value
				console.log('mirror-------------', uv)

				if (tree[uv]) {
					str = getTag(`${IN}\n` + genChildView(uv, IN, DI) + `\n${IN}`)
				} else {
					// use 无效的情况，为空标签
					str = getTag(``)
				}
			} else {
				// container
				let comment = ``
				// 去掉默认值
				if (name != '容器') {
					let rtxt = ` `
					if (remarks) {
						remarks = remarks.split('\n').join(`\n${IN}`)
						rtxt = ` : \n${IN}${remarks}\n${IN}`
					}
					comment = `${IN}<!-- ${name}${rtxt}-->\n`
				}
				if (target.children && target.children.length) {
					str =
						`${comment}` +
						getTag(target.children.map((id, index) => `\n` + genChildView(id, IN, DI)).join('') + `\n${IN}`)
				} else {
					str = `${comment}` + getTag(``)
				}
			}
		}

		return str
	}

	let childview = tree[lid].children.map((cid, index) => genChildView(cid, '\t', 0)).join('\n')

	let { eventMarks, eventMethods } = genEventContent(lid, tree[lid].events)

	eventContent.push(...eventMethods)

	const EBD = eventMarks.length > 0 ? ' ' + eventMarks.join(' ') : '' //eventBinding

	// clone 的元素需要去重
	eventContent = [ ...new Set(eventContent) ].join(',')

	let readyContent = []

	let created = ``

	const genCreated = () => {
		if (!CE_list.length) return

		let { eventMarks, eventMethods } = genEventContent(lid, CE_list, false)

		let genStr = str => `
		created() {
			${str}
		},`

		let str = ``
		let unstr = ``

		CE_list.forEach((evo, I) => {

			let { hid, event, select, mds, target } = evo

			let subscriber = select.includes('once') ? 'FN.PS.subscribeOnce' : 'FN.PS.subscribe'

			let fn_body = eventMethods[I].replace('async', 'async function')
			let sub_name = event == 'modelchange' ? `${target || hid}.${mds}.${event}` : event

			str += `
			FN.PS.unsubscribe(FN.PS_ID.${hid}_${event})
			FN.PS_ID.${hid}_${event} = ${subscriber}('${sub_name}', this.EV(this.clone, ${fn_body}, '${hid}'))`
			// 在生产模式下函数名会去掉，因此这里需要将 hid 加进去

			unstr += ``
		})

		created = genStr(str)

		// CE_list 添加成功后清空，避免污染
		CE_list = []
	}

	genCreated()

	return `<template>
  <IFlevel class="wrap" hid="${lid}" :clone="clone" :class="CLASS"${EBD}>
  <div class="frame" :style="STYLE">
${childview}
  </div>
  </IFlevel>
</template>

<script>
import FA from '../common/FA'
import FX from '../common/FX'
import MF from '../common/MF'

export default {${created}
  methods: {
    ${eventContent}
	},
	mounted() {
		${readyContent}
	}
}
</script>  
`
}

exports.genScriptDeps = (prefix, ids, dict, namespace, useWindow = false) => {
	let injectDeps = ids.map((id) => {
		let { dir, key } = dict[id]

		return `import ${id} from './${prefix}${dir || ''}/${key}' `
	})

	let roadMap = {}

	let injectRoad = ids.map((id) => {
		let { dir, key } = dict[id]

		let p = roadMap
		let arr = dir ? dir.split('/').filter((e) => e) : []

		// 生成目录
		arr.forEach((d) => {
			p[d] = p[d] || {}
			p = p[d]
		})

		p[key] = `__R__${namespace}.${id}__R__`
	})

	let body = `
	
	`

	if (useWindow) {
		body += `
const ${namespace} = {
	${ids.join(',\n')}
}
`
	} else {
		body += `
import FA from './FA'

const ${namespace} = {
	...FA.promisify({
		${ids.join(',\n')}
	})
}
`
	}

	return `
${injectDeps.join('\n')}
${body} 
export default ${replaceDot(JSON.stringify(roadMap, null, 2)).replaceAll('"__R__', '').replaceAll('__R__"', '')}
`
}

exports.replaceDot = replaceDot
