// pages/logisticsLog/logisticsLog.js
const app = getApp();
const quick = require('../../utils/quick.js');
const util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: []
  },

  onLoad(options) {
    if (!options.orderNo) {
      quick.showToastNone('页面错误!');
      return;
    }
    wx.showLoading()
    this.getLogisticsInfo(options.orderNo);
  },

  getLogisticsInfo(orderNo) {
    quick.requestGet({ url: 'getLogisticsInfo' }, {
      openId: app.globalData.openId,
      orderNo,
    }).then( res => {
      let { code, data } = res.data;

      if( code === 0 && data != null) {
        data = JSON.parse(data);
        console.log(data)
        this.setData({
          list: data
        })
      }
      wx.hideLoading();
    })
  }
})