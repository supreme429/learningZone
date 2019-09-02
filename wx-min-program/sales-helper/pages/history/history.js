// pages/history/history.js
const app = getApp();
const quick = require('../../utils/quick.js');
const util = require('../../utils/util.js');
const date = new Date();
const preMonth = util.getPreMonth(new Date(), 1);
console.log(util.getPreMonth(new Date(), 1))
Page({

  /**
   * 页面的初始数据
   */
  data: {
    saleDetailData: {
      title: preMonth,
      isShowDatePicker: true, //是否显示日期选择
      start: util.getPreMonth(new Date(), 7),
      end: preMonth,
      pageData: {},
      month: preMonth,
    }
  },

  bindDateChange(){
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      date: e.detail.value
    })
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

  bindDateChange(e) {
    this.setData({
      'saleDetailData.title': e.detail.value,
      'saleDetailData.month': e.detail.value,
    })
  },

  getMonthlyData() {
    quick.requestGet({ url: 'getMonthlyData' }, {
      userId: app.globalData.userId,
      month: this.data.saleDetailData.month
    }).then(res => {
      let { code, data } = res.data;
      if (code === 0) {
        data = JSON.parse(data);
        this.setData({
          'saleDetailData.pageData': data
        })
      }
    })
  }
})