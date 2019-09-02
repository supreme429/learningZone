// pages/userNoExist/userNoExist.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  onShareAppMessage() {
    return app.globalData.shareInfo
  },
})