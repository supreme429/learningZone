const quick = require('./quick.js')

const getNetwordType = () => {
  wx.onNetworkStatusChange(function (res) {
    console.log('getNetwordType:', res)
    // 返回网络类型, 有效值：
    // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
    if (res.networkType === 'none') {
      wx.navigateTo({
        url: '/pages/noInternet/noInternet',
      });
    }
  })
}

const getSearchHotKey = (app) => {
  quick.requestGet({ url: 'searchHotKey' }, {})
    .then(res => {
      const { code, data } = res.data;
      if (code === 0) {
        app.globalData.keywords = data.keywords
        app.globalData.searchWord = data.searchWord
      }
    })
}

module.exports = {
  getNetwordType,
  getSearchHotKey,
}