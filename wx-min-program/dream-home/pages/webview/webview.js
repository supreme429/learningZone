// miniprogram/pages/webview/webview.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: '',
    isShow: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading()
    if (!options.url) return;
    setTimeout(() => {
      this.setData({
        url: options.url,
        isShow: true
      })
      setTimeout(() => {
        wx.hideLoading()
      }, 1000)
    }, 200)
  },
})