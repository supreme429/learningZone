// pages/scanCodeReceiving/components/userInfo/userInfo.js
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    app: app,
    // isShowInfo: app.globalData.wxPhone? true: false,
    name: '',
    rank: '',
    headUrl: ''
  },

  // 生命周期
  attached: function(){
    if (app.globalData['userInfo']){
      this.setData({
        'name': app.globalData['userInfo'].name,
        'rank': app.globalData['userInfo'].rank,
        'headUrl': app.globalData['userInfo'].headUrl
      })
    }else if (app.globalData.wxPhone && !app.globalData['userInfo']){
      this.getUserInfo()
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getUserInfo: function(){
      const requectUrl = {
        url: 'getUserMllInfo',
      }
      const requestData = { 
        openId: app.globalData.openId,
        unionId: app.globalData.unionId,
        phone: app.globalData.wxPhone
      }
      app.requestGet(requectUrl, requestData).then(response => {
        try{
          const code = response.data.code;
          if (code === 0) {
            const data = response.data.data;
            this.setData({
              'name': data.name,
              'rank': data.rank,
              'headUrl': data.headUrl
            })
            app.globalData['userInfo'] = {
              'name': data.name,
              'rank': data.rank,
              'headUrl': data.headUrl
            }
          }
        } catch(e){
          wx.showToast({
            title: '获取用户信息失败',
            icon: 'none'
          })
        }
      })
    }
  }
})
