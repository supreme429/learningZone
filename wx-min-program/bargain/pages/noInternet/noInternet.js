// pages/noInternet/noInternet.js
const business = require('../../utils/business.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    setTimeout(() => {
      wx.stopPullDownRefresh()
      business.getNetwordType().then(function() {
       wx.redirectTo({
         url: '/pages/index/index',
       }) 
      });
    }, 2000)
  },
})