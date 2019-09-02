const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//获取系统信息
const getSystemInfoAsync = () => {
  return new Promise((resolve, reject) => {
    wx.getSystemInfo({
      success: (res) => {
        resolve(res)
      },
    })
  })
}

//获取指定id的dom元素的信息
const getDomInfoById = id => {
  return new Promise((resolve, reject) => {
    wx.createSelectorQuery().select(id).boundingClientRect(function (rect) {
      resolve(rect)
    }).exec()
  })
}

//设置页面标题
const setNavigationBarTitle = title => {
  wx.setNavigationBarTitle({
    title: title,
    success: () => { }
  })
}

module.exports = {
  formatTime: formatTime,
  getSystemInfoAsync,
  getDomInfoById,
  setNavigationBarTitle
}
