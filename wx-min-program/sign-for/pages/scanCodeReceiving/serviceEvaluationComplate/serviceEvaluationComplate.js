// pages/scanCodeReceiving/serviceEvaluationComplate/serviceEvaluationComplate.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    redAmount: '', //红包金额
    redName: '',  //红包名称
    redCode: '',  //红包码
    toggle: {
      isShowCopyToast: false,
      isOpenRed: false,
    },
    toast:{
      info: "复制成功"
    }
  },

  copyCode: function(){
    var self = this;
    wx.setClipboardData({
      data: self.data.redCode,
      success: function (res) {
        //self.toggleToast();
      }
    })
  },

  toggleToast: function(){
    var self = this;
    this.setData({
      'toggle.isShowCopyToast': true
    })
    setTimeout(function(){
      self.setData({
        'toggle.isShowCopyToast': false
      })
    },1500)
  },


  //关闭红包弹窗
  toggleModalRed: function () {
    this.setData({
      'toggle.isShowRedModal': !this.data.toggle.isShowRedModal
    })
  },

  // 打开红包
  openRed: function(){
    var self = this;
    var requectUrl = {
      url: 'sendRed',
    }
    var requestData = {
      deliveryNo: app.globalData.scanCodeRecevingInfo.deliveryNo,
      signOpenId: app.globalData.openId,
      unionId: app.globalData.unionId
    }
    app.requestPost(requectUrl, requestData).then(function(response){
      var res = response.data
      if(res.code === 0){
        const data = JSON.parse(res.data);
        self.setData({
          'redAmount': self.formatAmount(data.redAmount),
          'redName': data.redName,
          'redCode': data.redCode,
          'toggle.isOpenRed': true
        })
      }else{
        wx.showToast({
          title: '当前红包已领完，谢谢您的支持！',
          icon: 'none',
          success: function(){
            self.toggleModalRed()
          }
        })
      }
    })
  },

  // 分转元
  formatAmount: function (amount) {
    amount = new Number(amount) / 100;
    return amount === 0 ? 0 : amount.toFixed(0);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    setTimeout(function(){
      self.toggleModalRed()
    },1000)
  },
})