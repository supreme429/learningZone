// components/getUserInfo/getUserInfo.js
const app = getApp();
const quick = require('../../utils/quick.js');
const business = require('../../utils/business.js');
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

  },
  ready() {
    wx.checkSession({
      fail() {
        app.getOpenId();
      }
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {
    getUserInfo(e) {
      const { encryptedData, iv } = e.detail;

      business.addUserInfo({
        openId: app.globalData.openId,
        unionId: app.globalData.unionId,
      }, e.detail.userInfo)
      
      quick.requestPost({ url: 'decryptData' }, {
        encryptedData, 
        iv,
        sessionKey: app.globalData.sessionKey
      }).then(res => {
        const { code, data } = res.data;

        wx.setStorage({
          key: 'userInfo',
          data: {
            openId: app.globalData.openId,
            sessionKey: app.globalData.sessionKey,
            unionId: data.unionId,
          }
        })
        app.globalData.unionId = data.unionId;

        this.triggerEvent('close');
      })
    }
  }
})
