// pages/login/login.js
const $ = global;
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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
    // 调用跟踪代码
    $.track.push(['trackView']);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 点击获取手机号回调
   */
  getPhoneNumber: function(e) {
    console.log(e)
    if (e.detail.errMsg == "getPhoneNumber:ok"){
      //登录
      let params = {
        'type': 3,
        'encryptedData': e.detail.encryptedData,
        'iv': e.detail.iv
      }
      $.util.userLogin(params,1) 
    }
  },
  /**
   * 手机号登录回调
   */
  loginMobile() {
    
    wx.navigateTo({
      url: '/pages/login/loginMobile',
    });
  }
})