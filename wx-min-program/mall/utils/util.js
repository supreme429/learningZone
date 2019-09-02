import $ajax from 'ajax.js';
import config from 'config.js';
const util = {
  formatTime(date) {
    var date = new Date(parseInt(date)*1000)
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    return [year, month, day].map(formatNumber).join('/')
    function formatNumber(n) {
      n = n.toString()
      return n[1] ? n : '0' + n
    }
  },
  getImgVerifyCode() {//获取图片验证码
    var t = new Date().getTime()
    var ecsId = wx.getStorageSync('ECS_ID').substr(0, 32)
    var url = config.REQUEST_URL + 'solr_api/captcha/getCaptcha.do?t=' + t + '&ecsId=' + ecsId;
    return url
  },
  userLogin(params, style) {//用户登录
    $ajax({
      url: config.REQUEST_URL + 'dubbo_api/user/newThird/miniAppLogin',
      data: params,
      method: 'POST',
      dataType: 'JSON',
      success: function (msg) {
        var datas = JSON.parse(msg.data)
        if (datas.error == 0) {
          let COOKIE = wx.getStorageSync('COOKIE2')
          for (var i in datas.data) {
            wx.setStorageSync(i, datas.data[i])
            COOKIE = COOKIE + i + '=' + datas.data[i] + ';'
          }
          wx.setStorageSync('COOKIE', COOKIE)
          wx.setStorageSync('loginStatus', 'true')
          if (style){
            wx.navigateBack({
              delta: style
            })
          }
        }
      }
    })
  },
  guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
export default util;
