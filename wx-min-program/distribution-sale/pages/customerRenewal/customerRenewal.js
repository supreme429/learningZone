// pages/customerRenewal/customerRenewal.js
const app = getApp();
const quick = require('../../utils/quick.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    customerInfo: {
      
    },
    id: '', //客户id 
    note: '', //续期理由
    errorTips: '',
    toggle: {
      isShowRolloverModal:false,
      isChecked: false,
    },
    isDbSubmit: false
  },

  //设置续期理由的值
  setNote(event){
    this.setData({
      note: event.detail.value
    })
  },

  //获取客户资料
  getCustomerInfo(){
    var self = this;
    var requectUrl = {
      url: 'getCustomerInfo',
    }
    var requestData = {
      belongUser: app.globalData.userShowInfo.userId,
      id: this.data.id
    }
    quick.requestGet(requectUrl, requestData).then(function (res) {
      if (!res.data.code) {
        self.setData({
          customerInfo: JSON.parse(res.data.data)
        })
      }
    })
  },

  //切换续期理由弹框
  toggleModalRollover: function(){
    this.setData({
      'toggle.isShowRolloverModal': !this.data.toggle.isShowRolloverModal
    })
  },

  //禁止事件冒泡
  cancelToggle(){},

  //检验是否填写了续期理由
  checkNote: function(){
    if(this.data.note == ''){
      this.setData({
        errorTips: '请填写续期原因',
        'toggle.isChecked': false
      })
      return;
    }
    this.setData({
      errorTips: '',
      'toggle.isChecked': true
    })
  },

  //提交续期
  customerRenewal(){
    var self = this;
    this.checkNote()
    if (!this.data.toggle.isChecked || this.data.isDbSubmit) return;
    this.data.isDbSubmit = true
    var requectUrl = {
      url: 'customerRenewal',
    }
    var requestData = {
      belongUser: app.globalData.userShowInfo.userId,
      id: this.data.id,
      note: this.data.note
    }
    quick.requestPost(requectUrl, requestData).then(function (res) {
      if (!res.data.code) {
        self.getCustomerInfo()
        self.toggleModalRollover()
        self.setData({
          note: '',
          isDbSubmit: false
        })
        quick.showToastNone('提交成功')
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      id: options.id
    })
    this.getCustomerInfo()
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
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})