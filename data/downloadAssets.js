const fs = require('fs')
const download = require('download')
const reg_filename = /(.*\/)*(.+)/
const assetsPath = '/assets/'

let assetsList = []
// 直接修改对象
function localizImage(obj) {
  let bgi = obj['backgroundImage']
  if (bgi) {

    let url = bgi.match(/url\((.+)\)/)[1].replace(/"/g, '')

    assetsList.push(url)

    let newUrl = assetsPath + url.match(reg_filename)[2]

    obj['backgroundImage'] = `url(${newUrl})`
  }
}

function traverseArray(arr, callback) {
  arr.forEach((item, index) => {
    if (Array.isArray(item)) {
      traverseArray(item)
    } else {
      callback(arr, index)
    }
  })
}

function localizModel(obj) {
  if (obj.url) {
    let { value } = obj.url

    if (Array.isArray(value)) {
      assetsList.push(...value.toString().split(','))

      traverseArray(value, (arr, index) => {
        arr[index] = assetsPath + arr[index].match(reg_filename)[2]
      })
    } else {
      assetsList.push(value)
      obj.url.value = assetsPath + value.match(reg_filename)[2]
    }
  }
}

function downloadAssets(getAssetsPath) {
  return Promise.all([...new Set(assetsList)].map(url => {
    return new Promise(async done => {
      let filename = url.match(reg_filename)[2]
      let road = getAssetsPath(filename)

      if (fs.existsSync(road)) return done(true)

      console.log('Download...', url)

      // 保存到本地
      await download(url, getAssetsPath(''))
      done(true)
    })
  }))
}

exports.localizImage = localizImage
exports.localizModel = localizModel 
exports.downloadAssets = downloadAssets