// pages/noInternet/noInternet.js
const business = require('../../utils/business.js');
const { router } = require('../../utils/router.js');
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
      wx.getNetworkType({
        success: res => {
          const networkType = res.networkType
          if (networkType !== 'none') {
            wx.redirectTo({
              url: router('index'),
            })
          }
          
        }
      })
    }, 2000)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
})