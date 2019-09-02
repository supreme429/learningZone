// pages/incentiveInfo/incentiveInfo.js
const app = getApp();
const quick = require('../../utils/quick.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageData: {},
    month: '',
    incentiveList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { month } = options;
    if(!month) {
      quick.showToastNone('页面错误!')
      return;
    }
    this.data.month = month;
    this.getMonthlyDetailsData();
    this.showTips();
  },
  onShareAppMessage() {
    return app.globalData.shareInfo
  },

  getMonthlyDetailsData() {
    quick.requestGet({ url: 'getMonthlyDetailsData'}, {
      userId: app.globalData.userId,
      month: this.data.month
    }).then(res => {
      let {code, data} = res.data;
      if(code === 0) {
        data = JSON.parse(data);
        this.setData({
          incentiveList: this.setIncentiveHead(data)
        })
      }
    })
  },

  // 设置字段
  setIncentiveHead(data) {
    const role = app.globalData.userRole;
    let arr = [];
    // 销售提成
    arr.push({
      title: "销售提成",
      value: data['salePercentage'],
      childs: []
    })
    // 收款提成 || 销量提成
    arr[0].childs.push({
      title: role == 2 ? "销售提成" : "收款提成",
      value: data['receivePercentage'],
      url: this.getRelevantOrderUrl(role == 2 ? 3 : 1)
    })
    arr[0].childs.push({
      title: "退款扣除",
      value: data['refundPercentage'],
    })
    if (role == 2) {
      arr[0].childs.push({
        title: "发货量提成",
        value: data['deliverPercentage'],
        url: this.getRelevantOrderUrl(4)
      })
    }

    // 月奖励
    arr.push({
      title: "月奖励",
      value: data['monthAward'],
      childs: []
    })

    arr[1].childs.push({
      title: "大单奖励",
      value: data['largeOrderAward'],
      url: this.getRelevantOrderUrl(8)
    })
    arr[1].childs.push({
      title: "新品奖励",
      value: data['newGoodsAward'],
      url: this.getRelevantOrderUrl(9)
    })
    arr[1].childs.push({
      title: "床垫奖励",
      value: data['mattressAward'],
      url: this.getRelevantOrderUrl(10)
    })
    arr[1].childs.push({
      title: "扣款",
      value: data['refundAward'],
      url: this.getChargesDetailUrl()
    })

    return arr;
  },

  getRelevantOrderUrl(orderType) {
    return `/pages/relevantOrder/relevantOrder?month=${this.data.month}&orderType=${orderType}`;
  },

  getChargesDetailUrl() {
    return `/pages/chargesDetail/chargesDetail?month=${this.data.month}`;
  },

  showTips(){
    let { rewardTips, showStatus } = app.globalData.tipsData
    if (showStatus == 1){
      quick.showToastNone(rewardTips)
    }
  }
})