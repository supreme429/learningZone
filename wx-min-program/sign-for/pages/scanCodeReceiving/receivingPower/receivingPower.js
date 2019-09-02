// pages/scanCodeReceiving/receivingPower/receivingPower.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isSend: false, // 是否发送授权
    consigneePhone: '', // 收货人手机
    capCodeSrc: '', // 图片验证码路径
    isNeedCapCode: false, // 是否需要验证码
    isDbSend: false, // 是否重提交
    capCode: '', // 图片验证码
    smsCode: '', // 短信验证码
    isShowBtnBak: false, // 是否可展示备用手机号码授权
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.checkConsigneePhoneBak();
    this.getConsigneePhone();
    this.getCapCodeSrc();
  },

  onShow: function() {
    app.jumpScanCodeIndex();
  },

  // 获取收货人手机
  getConsigneePhone() {
    let phone = app.globalData.scanCodeRecevingInfo.consigneePhone || app.globalData.scanCodeRecevingInfo.consigneePhoneBak;
    phone = ("" + phone).replace(/\s/g, "").split('');
    phone.splice(3, 4, '****');

    this.setData({
      consigneePhone: phone.join('')
    })
  },

  // 发送验证码
  sendCode() {
    if (this.data.capCode.length < 4 && this.data.isNeedCapCode && !this.data.isDbSend) return;
    this.data.isDbSend = true;
    app.requestPost({ url: 'sendRequestSms'}, {
      deliveryNo: app.globalData.scanCodeRecevingInfo.deliveryNo,
      phone: app.globalData.scanCodeRecevingInfo.consigneePhone || app.globalData.scanCodeRecevingInfo.consigneePhoneBak,
      signOpenId: app.globalData.openId,
      capCode: this.data.capCode
    }).then(res => {
      this.data.isDbSend = false;
      if(res.data.code === 0) {
        this.setData({
          isSend: true
        })
      } else if (res.data.code === 1001) {
        this.setData({
          isNeedCapCode: true
        })
      } else {
        this.sendCodeFail(res.data.code)
      }
    }).catch(() => {
      this.data.isDbSend = false;
      this.sendCodeFail()
    })
  },

  // 提交验证码
  submitCode() {
    if (this.data.smsCode.length < 6) return;
    
    app.requestPost({ url: 'checkSmsVerCode' }, {
      deliveryNo: app.globalData.scanCodeRecevingInfo.deliveryNo,
      phone: app.globalData.scanCodeRecevingInfo.consigneePhone || app.globalData.scanCodeRecevingInfo.consigneePhoneBak,
      signOpenId: app.globalData.openId,
      verCode: this.data.smsCode
    }).then(res => {
      if(res.data.code === 0) {
        // 成功跳转到签收界面
        wx.redirectTo({
          url: '/pages/scanCodeReceiving/signIn/signIn',
        })
      } else {
        this.sendCodeFail(1000)
      }
    })
  },

  // 输入图片验证码
  inputCapCode(e) {
    this.setData({
      capCode: e.detail.value
    })
  },

  // 输入短信验证码
  inputSmsCode(e) {
    this.setData({
      smsCode: e.detail.value
    })
  },

  // 获取短信验证码
  getCapCodeSrc() {
    this.setData({
      'capCodeSrc': app.getRequestUrl('ntpl/code/captcha-image', 'signmina') + '?openId=' + app.globalData.openId + '&t=' + new Date().getTime()
    })
  },

  // 发送短信验证码失败提示
  sendCodeFail(code) {
    const langCode = {
      1000: '验证码错误,请重新输入！'
    }
    this.getCapCodeSrc();
    wx.showToast({
      title: langCode[code] || '发送失败，请重试！',
      icon: 'none'
    })
  },

  // 检测备用号码是否为手机
  checkConsigneePhoneBak() {
    const consigneePhoneBak = app.globalData.scanCodeRecevingInfo.consigneePhoneBak;
    this.setData({
      isShowBtnBak: /^1(\d){10}$/.test(consigneePhoneBak)
    })
  },

  // 设定备用手机号码为收货主号码
  setBakPhone() {
    app.globalData.scanCodeRecevingInfo.consigneePhone = app.globalData.scanCodeRecevingInfo.consigneePhoneBak;
    this.getConsigneePhone();
    this.sendCode();
  },
  
})