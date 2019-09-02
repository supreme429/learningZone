// pages/estimate/estimate.js
const app = getApp();
const util = require('../../utils/util.js');
const quick = require('../../utils/quick.js');
const date = new Date();
const currentMonth = `${date.getFullYear()}-${date.getMonth() + 1}`;
console.log(currentMonth)
Page({

  /**
   * 页面的初始数据
   */
  data: {
    saleDetailData: {
      title: '本月预估',
      isShowDatePicker: false, //是否显示日期选择
      // start: util.getPreMonth(new Date(), 6),
      // end: '',
      pageData: {},
      month: currentMonth,
    },
    tipsData: app.globalData.tipsData
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getMonthlyData();
  },
  onShareAppMessage() {
    return app.globalData.shareInfo
  },

  getMonthlyData() {
    quick.requestGet({ url: 'getMonthlyData'}, {
      userId: app.globalData.userId,
      month: this.data.saleDetailData.month
    }).then(res => {
      let {code, data} = res.data;
      if(code === 0) {
        data = JSON.parse(data);
        this.setData({
          'saleDetailData.pageData': data
        })
      }
    })
  }
})