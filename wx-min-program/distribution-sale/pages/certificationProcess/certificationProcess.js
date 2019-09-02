// pages/certificationProcess/certificationProcess.js
const app = getApp();
const quick = require('../../utils/quick.js')
const util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    formData: {
      capCode: '',  //图形验证码
      phone: '',
      name: '',
      verCode: '',  //短信验证码
      note: ''
    },
    errorTips: '',
    langs: {
      incompleteTips: '提交失败，信息未完整填写',
    }, 
    toggle:{
      isNeedCapCode: false, //是否需要图形验证码
      isChecked: false
    },
    counter: 60,
    capCodeSrc: '',
    captchaType: '',//短信认证
    isGetSMS: false,
    isDbSend: false,
    isDbSubmit: false,
  },

  countdown() {
    setTimeout(() => {
      this.data.counter--;
      this.setData({
        counter: this.data.counter
      })
      if (this.data.counter === 0) {
        this.data.counter = 60;
        this.setData({
          isGetSMS: false
        })
        return;
      }
      this.countdown();
    }, 1000)
  },

  //改变提交数据
  changeFormData(event){
    var key = event.target.dataset.key
    var changeStr = 'formData.' + key
    var value = event.detail.value
    this.setData({
      [changeStr]: value
    })
  },

  //复制链接
  copyLink(){
    wx.setClipboardData({
      data: 'http://zx.meilele.com',
      success: function(){}
    })
  },

  //回到首页
  goToIndex() {
    wx.switchTab({
      url: '/pages/index/index',
      success: function () {

      }
    })
  },

  getCode(){
    if (this.data.formData.phone == ''){
      quick.showToastNone('请输入手机号码');
      return;
    }
    if (this.data.formData.capCode.length < 4 && this.data.toggle.isNeedCapCode && !this.data.isDbSend) return;
    this.data.isDbSend = true;
    quick.requestPost({ url: 'sendSmsCode'}, {
      phone: this.data.formData.phone,
      sendType: 'apply',
      openId: app.globalData.openId,
      capCode: this.data.formData.capCode
    }).then(res => {
      //const { code, data } = res.data;
      this.data.isDbSend = false;
      if (res.data.code === 0) {
        this.setData({
          isGetSMS: true,
          captchaType: res.data.data
        })
        this.countdown();
      } else if (res.data.code === 1000) {
        quick.showToastNone('请输入图片验证码');
      } else if (res.data.code === 1001) {
        this.setData({
          'toggle.isNeedCapCode': true
        })
        this.getCapCodeSrc();
        quick.showToastNone('请输入图片验证码');
      } else {
        quick.showToastNone('发送失败，请重试！');
      }
    }).catch(() => {
      this.data.isDbSend = false;
      quick.showToastNone('发送失败，请重试！');
    })

  },

  getCapCodeSrc(){
    this.setData({
      capCodeSrc: util.getCapCodeSrc(app.globalData.openId)
    })
  },

  //验证数据
  checkFormData() {
    for (var key in this.data.formData) {
      if (this.data.formData[key] === '' && key != 'capCode') {
        this.setData({
          'toggle.isChecked': false,
          errorTips: this.data.langs.incompleteTips
        })
        return;
      }
    }
    this.setData({
      errorTips: '',
      'toggle.isChecked': true,
    })
  },

  //提交数据
  submitFormData() {
    var self = this;
    var requectUrl = {
      url: 'saveApply',
    }
    this.checkFormData();
    if (!this.data.toggle.isChecked) return;
    var requestData = JSON.parse(JSON.stringify(this.data.formData));
    requestData['userId'] = app.globalData.userShowInfo.userId;
    requestData['captchaType'] = this.data.captchaType
    this.setData({
      isDbSubmit: true,
    })
    quick.requestPost(requectUrl, requestData).then(res => {
      if (!res.data.code) {
        quick.showToastNone('提交成功');
        setTimeout(function () {
          self.goToIndex()
        }, 1000)
      } else if (res.data.code == 1001){
        quick.showToastNone('提交失败,验证码错误')
      } else{
        quick.showToastNone('提交失败')
      }
      this.setData({
        isDbSubmit: false,
      })
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(getCurrentPages())
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  onUnload: function(){
    // this.goToIndex()
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})