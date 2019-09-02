// miniprogram/pages/index/index.js
const app = getApp();
const { router } = require('../../utils/router.js');
const business = require('../../utils/business.js');
const { appId, appName } = require('../../config/config.js');
const quick = require('../../utils/quick.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userShowInfo: null,
    appName,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setUserShowInfo();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    business.addShare(app.globalData.openId)
    return business.setMinaShareConfig(app)
  },

  // 处理获取用户信息
  handleUserInfo(e) {
    if (app.globalData.userShowInfo != null) {
      this.goPageGame();
      return;
    }
    
    const { userInfo, errMsg } = e.detail;
    if (errMsg === 'getUserInfo:ok') {

      business.updateUserInfo({
        appId,
        openId: app.globalData.openId,
        nickName: userInfo.nickName,
        headImgUrl: userInfo.avatarUrl,
      })
      app.globalData.userShowInfo = {
        nickName: userInfo.nickName,
        headImgUrl: userInfo.avatarUrl
      }
      this.goPageGame();
    }
  },

  goPageGame() {
    business.addJoin(app.globalData.openId);
    wx.navigateTo({
      url: router('game'),
    })
  },
  
  setUserShowInfo() {
    if (app.globalData.userShowInfo) {
      this.setData({
        userShowInfo: app.globalData.userShowInfo
      })
      return;
    }
    setTimeout(() => {
      this.setUserShowInfo();
    }, 100)
  }
})