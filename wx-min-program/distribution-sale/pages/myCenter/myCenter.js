// pages/myCenter/myCenter.js
const app = getApp();
const business = require('../../utils/business.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    app: app,
    headUrl: '',
    phone: '',
    userName: '',
  },

  onLoad(options) {
    setTimeout(() => {
      const userShowInfo = app.globalData.userShowInfo;
      console.log(userShowInfo)
      this.setData({
        headUrl: userShowInfo.headUrl,
        phone: this.handlePhone(userShowInfo.mobile),
        userName: userShowInfo.name,
      })
    }, 600)
  },

  // 获取收货人手机
  handlePhone(phoneNum) {
    let phone = ("" + phoneNum).replace(/\s/g, "").split('');
    phone.splice(3, 4, '****')
    return phone.join("");
  },

  // 退出登录
  logout() {
    wx.removeStorage({
      key: "userShowInfo",
      success: () => {
        app.userShowInfo = null;
        business.goPageLogin();
      }
    });
  },

  goCentification() {
    wx.switchTab({
      url: '/pages/index/index',
      success: function () {
        wx.navigateTo({
          url: '/pages/certificationProcess/certificationProcess',
        })
      }
    })
  }
})