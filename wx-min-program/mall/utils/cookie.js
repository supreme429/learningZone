import config from 'config.js';
module.exports =function(callback) {
  let that = this;
  let UUID = wx.getStorageSync('UUIDSSTR')
  console.log('UUID',UUID)
  return new Promise((resolve)=>{
    wx.request({
      url: config.REQUEST_URL + 'dubbo_api/user/newThird/miniAppCookie?UUID=' + UUID,
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        let cookies = '';
        for (var i in res.data.data) {
          cookies = cookies + i + '=' + res.data.data[i] + ';'
          wx.setStorageSync(i, res.data.data[i])
        }
        // cookies = cookies.substr(0, cookies.length-1)
        console.log('cookie拼接打印', cookies)
        wx.setStorageSync('COOKIE', cookies)
        wx.setStorageSync('COOKIE2', cookies)
        resolve(cookies)
      }
    })
  })
}
