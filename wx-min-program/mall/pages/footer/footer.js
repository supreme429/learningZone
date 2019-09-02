// pages/footer/footer.js
const $ = global;
const app = getApp();
const requestPrefix = app.globalData.domain;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    types: Object
  },

  /**
   * 组件的初始数据
   */
  data: {
    
  },

  /**
   * 组件的方法列表
   */
  methods: {
    switchtab:function(e){
      let types = this.data.types.value;
      console.log('打印', types)
      let tab = e.currentTarget.dataset.tab
      let loginStatus = wx.getStorageSync('loginStatus')
      if (types == tab){
        return
      }
      if (tab==0){
        wx.reLaunch({
          url: '../index/index',
        })
      } else if (tab == 1){
        wx.reLaunch({
          url: '../category/category',
        })
      } else if (tab == 2) {
        if (loginStatus){
          wx.reLaunch({
            url: '../mine/mine',
          })
        }else{
          wx.navigateTo({
            url: '../login/login',
          })
        }
      }
    },
    getUserInfo:function(e){
      console.log('授权',e)
      if (e.detail.errMsg == "getUserInfo:ok"){
        //登录
        $.ajax({
          url: app.globalData.Login_url + 'dubbo_api/user/newThird/miniAppLogin',
          data: {
            'type': 2,
            'encryptedData': e.detail.encryptedData,
            'iv': e.detail.iv
          },
          method: 'POST',
          dataType: 'JSON',
          success: function (msg) {
            var datas = JSON.parse(msg.data)
            if (datas.error == 0) {
              wx.reLaunch({
                url: '../mine/mine',
              })
              let COOKIE = wx.getStorageSync('COOKIE2')
              for (var i in datas.data) {
                wx.setStorageSync(i, datas.data[i])
                COOKIE = COOKIE + i + '=' + datas.data[i] + ';'
              }
              console.log(COOKIE)
              wx.setStorageSync('COOKIE', COOKIE)
            }else{
              wx.navigateTo({
                url: '../login/login',
              })
            }
          }
        })
      }
    }
  }
})
