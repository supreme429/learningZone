// pages/scanCodeReceiving/login/login.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  onLoad: function(options) {
    wx.checkSession({ // 检查sessionKey是否过期
      fail: function() {
        app.getOpenId();
      }
    });
  },
  
  onShow: function () {
    app.jumpScanCodeIndex();
  },

  getPhoneNumber: function(e) {
    // wx.navigateTo({
    //   url: '/pages/scanCodeReceiving/receivingPower/receivingPower',
    // });
    // return ;
    if(e.detail.errMsg.indexOf('ok') > -1 && e.detail.iv) {
      // 允许获取微信手机
      this.decryptionWxPhone(e);
    } else {
      wx.navigateTo({
        url: '/pages/scanCodeReceiving/receivingPower/receivingPower',
      })
    }
  },

  // 后台解密获取微信手机号
  decryptionWxPhone(e) {
    console.log(app.globalData.sessionKey)
    app.requestPost({ url: 'wXBizDataCrypt' }, {
      appId: app.globalData.appId,
      sessionKey: app.globalData.sessionKey,
      encryptedData: e.detail.encryptedData,
      iv: e.detail.iv,
    }).then(res => {
      const code = res.data.code;
      const data = res.data.data;
      if(code === 0) {
        app.globalData.wxPhone = data.purePhoneNumber;
        wx.setStorage({
          key: 'wxPhone',
          data: data.purePhoneNumber,
          success() {
            const scanCodeRecevingInfo = app.globalData.scanCodeRecevingInfo;
            if (app.globalData.wxPhone === scanCodeRecevingInfo.consigneePhone || app.globalData.wxPhone === scanCodeRecevingInfo.consigneePhoneBak) {
              wx.navigateTo({ // 缓存中有微信手机号，且与收货手机号或备用收货手机号一致跳转到签收页面
                url: '/pages/scanCodeReceiving/signIn/signIn',
              })
            } else {
              wx.navigateTo({ // 缓存中有微信手机号，但与收货手机号不一致跳转到签收授权页面
                url: '/pages/scanCodeReceiving/receivingPower/receivingPower',
              })
            }
          }
        })
      } else {
        console.log('手机解密失败')
        wx.showToast({
          title: '手机号码获取失败',
          icon: 'none'
        })
      }
    })
  },
})