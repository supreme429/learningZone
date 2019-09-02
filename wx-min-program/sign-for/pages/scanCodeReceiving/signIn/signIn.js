// pages/scanCodeReceiving/signIn/signIn.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderDetail: {
      orderNo: '',
      orderDate: '',
      orderAmount: '',
      consignee: '',
      phone: '',
      address: '', //收货地址
      distributionMode: '', //配送方式
      goodsList: [],
      signStatus: '', //签收状态（0：未签收，1：已签收） 
      evaluateStatus: ''
    },
    
    toggle: {
      isShowExc: true, //是否显示异常签收按钮
      isShowSignInModal: false,
      isShowSignInToast: false, //显示toast
      showSignBtn: false, // 接口未完成前不显示签收按钮
    },
    toast: {
      info: '签收成功'
    },
    hasGetOrderInfo: false,
  },

  //查询订单信息
  getOrderInfo: function(){
    var self = this;
    var requectUrl = {
      url: 'getOrderInfo',
    }
    var requestData = { deliveryNo: app.globalData.scanCodeRecevingInfo.deliveryNo}
    app.requestGet(requectUrl, requestData).then(function(res){
      const code = res.data.code;
      if (res.data.code === 0) {
        const data = JSON.parse(res.data.data);
        data.orderAmount = self.formatAmount(data.orderAmount)
        data.orderDate = self.formatDate(data.orderDate * 1000)
        self.setData({
          'toggle.showSignBtn': true,
          orderDetail: data,
          hasGetOrderInfo: true
        })
        if (data.signStatus == '1') {
          self.setIsShowExc(data.signDate*1000)
        }
      }
    })
  },

  // 签收
  signIn: function(){
    var self = this;
    var requectUrl = {
      url: 'sign',
    }
    var requestData = {
      unionId: app.globalData.unionId,
      deliveryNo: app.globalData.scanCodeRecevingInfo.deliveryNo,
      signOpenId: app.globalData.openId,
    }
    if (app.globalData.wxPhone){
      requestData['signPhone'] = app.globalData.wxPhone
    }else{
      requestData['orderPhone'] = app.globalData.scanCodeRecevingInfo.consigneePhone
    }
    app.requestPost(requectUrl, requestData).then(function(res){
      self.setData({
        'orderDetail.signStatus': '1',
        'toggle.isShowSignInModal': false
      })
      self.showToast();
    })
  },
  //显示签收成功
  showToast: function(){
    var self = this;
    this.setData({
      'toggle.isShowSignInToast': true
    })
    setTimeout(function(){
      self.setData({
        'toggle.isShowSignInToast': false
      })
      wx.navigateTo({
        url: '../serviceEvaluation/serviceEvaluation?consignee=' + self.data.orderDetail.consignee + '&orderId=' + self.data.orderDetail.orderId + '&orderSn=' + self.data.orderDetail.orderNo
      })
    },1500)
  },

  // 确认签收弹框
  toggleSignInModal: function(){
    var self = this;
    wx.showModal({
      title: '签收确认',
      content: '请确认您已收到送货单中所有商品',
      confirmColor: '#e62318',
      cancelColor: '#999',
      success: function (res) {
        if (res.confirm) {
          self.signIn();
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  },

  setIsShowExc: function (signDate){
    this.setData({
      'toggle.isShowExc': !this.checkOverTimeOut(signDate)
    })
  },

  // 分转元
  formatAmount: function(amount){
    amount = new Number(amount) / 100;
    return amount === 0 ? 0 : amount.toFixed(2);
  },
  //格式化时间戳
  formatDate: function(timeNum, connector = "-"){
    var self = this;
    var date = new Date(timeNum)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()

    return [year, month, day].map(self.formatNumber).join(connector)
  },

  formatNumber: n => {
    n = n.toString()
    return n[1] ? n : '0' + n
  },

  //判断离现在是否超过48小时
  checkOverTimeOut: function(timeNum){
    var nowDateTime = new Date().getTime()
    var msNum = 3600000 * 48;
    return nowDateTime - timeNum > msNum
  },

  //显示签收提示
  showSignInfo(){
    if (!this.data.hasGetOrderInfo) {
      setTimeout(() => {
        this.showSignInfo()
      }, 10)
      return;
    }
    if (this.data.orderDetail.signStatus == '0'){
      wx.showModal({
        title: '',
        content: '签收时请务必仔细核对收货商品是否完好，若商品有问题请务必异常签收，如正常签收后反馈的污损、少件问题将由您自己付费承担',
        showCancel: false,
        confirmText: '知道了',
        confirmColor: '#3abb06',
        success: () => { }
      })
    }   
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getOrderInfo()
  },

  onLoad(){
    this.showSignInfo()
  }

})