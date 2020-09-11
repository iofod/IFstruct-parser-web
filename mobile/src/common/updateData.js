const update = (name, data) => {
  let { subscriber, id: mid } = window.__VM__.$store.state.models[name]

  subscriber.forEach(sub => {
    let [hid, key] = sub.split('.')

    let hsets = window.FN.SETS(hid)
    if (!hsets) return warn(hid, '不存在！')

    let target = hsets.model[key]

    if (!target) return warn(key, '不存在！')

    const path = target.use.split('.')

    let value = { ...data }

    if (path[0] != mid) return false
    
    let D = path.slice(1).filter(v => v == 'n').length // ZI

    if (D) {
      let arr

      const fillArr = (value, road) => {
        let r = road[0]
        if (r == 'n') {
          road.shift()

          // 说明是多维，需要填充 空数组
          if (road.length > 1) {
            let k = road[0]

            return Array(value.length)
              .fill([])
              .map((a, i) => {
                return fillArr(value[i][k], road.slice(1))
              })
          } else {
            // 返回元素
            return value.map(obj => obj[road[0]])
          }
        } else {
          value = value[r]

          road.shift()

          return fillArr(value, road)
        }
      }

      arr = fillArr(value, path.slice(1))

      window.__VM__.$set(target, 'value', arr)
    } else {
      // 不包含维度 n 的，直接路径值填入
      path.slice(1).forEach(p => {
        value = value[p]
      })

      target.value = value
    }
  })
}

export default update
