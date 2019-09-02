// pages/chargesDetail/chargesDetail.js
const app = getApp();
const quick = require('../../utils/quick.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageData: {},
    month: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const month = options.month;
    if (!month) {
      quick.showToastNone('页面错误!')
      return;
    }
    this.data.month = month;
    this.getRefundData();
  },
  onShareAppMessage() {
    return app.globalData.shareInfo
  },

  getRefundData() {
    quick.requestGet({ url: 'getRefundData' }, {
      userId: app.globalData.userId,
      month: this.data.month
    }).then(res => {
      let { code, data } = res.data;
      if(code === 0) {
        data = JSON.parse(data);
        this.setData({
          pageData: data
        })
      }
    })
  }
})