// pages/relevantOrder/relevantOrder.js
const app = getApp();
const quick = require('../../utils/quick.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    enableBackToTop: true,
    isShowNoOrder: false,  //是否显示没有订单模块
    orderList: [],
    month: '',
    orderType: '',
    page: 0,
    pageCount: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { month, orderType } = options;
    if(!month || !orderType) {
      quick.showToastNone('页面错误!')
      return ;
    }
    this.data.month = month;
    this.data.orderType = orderType;
    this.getOrderList();
  },
  onShareAppMessage() {
    return app.globalData.shareInfo
  },

  getOrderList() {
    const data = this.data;
    if (data.pageCount != null && data.page >= data.pageCount) {
      return;
    }
    quick.requestGet({ url: 'getOrderData' }, {
      userId: app.globalData.userId,
      type: app.globalData.userRole,
      page: data.page,
      month: data.month,
      orderType: data.orderType,
    }).then(res => {
      let {code , data} = res.data;
      if(code === 0) {
        data = JSON.parse(data);
        this.setData({
          orderList: this.data.orderList.concat(data.list)
        })
        this.data.pageCount = data.pageCount;
        this.data.page++
      }
    })
  }
})