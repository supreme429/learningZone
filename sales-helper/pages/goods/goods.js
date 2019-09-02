// pages/user/user.js
const app = getApp();
const { config, env } = require('../../config/config.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsUrl: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let url = options.url;
    console.log('goodsLoad:');
    console.log('options:');
    console.log(options);
    console.log(options.url);
    this.data.goodsUrl = url;
    this.setData({
      goodsUrl: this.data.goodsUrl
    });
  },

  onShow: function() {
    console.log('onshow:')
  }
})