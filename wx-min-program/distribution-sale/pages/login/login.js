// pages/login/login.js
const app = getApp();
const quick = require('../../utils/quick.js');
const business = require('../../utils/business.js');
const util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    counter: 60,
    isGetSMS: true,

    capCodeSrc: '', // 图片验证码路径
    isNeedCapCode: false, // 是否需要图片验证码
    isDbSend: false, // 是否重提交
    phone: "",
    capCode: '', // 图片验证码
    verCode: "", // 短信验证码
    captchaType: "", // 获取短信验证码时返回，校验时带上
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getCapCodeSrc();
    wx.getStorage({
      key: 'userShowInfo',
      success: function(res) {
        wx.switchTab({
          url: '/pages/index/index',
        })
      },
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

  inputValue(e){
    const { field } = e.currentTarget.dataset;

    this.setData({
      [field]: e.detail.value
    })
  },

  // 发送短信验证码
  getVcode() {
    if (!this.data.phone) {
      quick.showToastNone('请输入您的手机号码');
      return;
    }
    
    if (this.data.capCode.length < 4 && this.data.isNeedCapCode && !this.data.isDbSend) return;
    this.data.isDbSend = true;
    const data = {
      openId: app.globalData.openId,
      sendType: "login", // 验证码类型
      phone: this.data.phone,
      capCode: this.data.capCode,
    };
    quick.requestPost({ url: 'sendSmsCode' }, data).then(res => {
      this.data.isDbSend = false;
      const { code, data } = res.data;
      if(code === 0) {
        this.setData({
          isGetSMS: false,
          captchaType: data
        })
        this.countdown();
      } else if (res.data.code === 1000) {
        quick.showToastNone('请输入图片验证码');
      } else if (res.data.code === 1001) {
        this.setData({
          isNeedCapCode: true
        })
        quick.showToastNone('请输入图片验证码');
      } else {
        quick.showToastNone('发送失败，请重试！');
      }
    })
  },
  // 倒计时
  countdown() {
    setTimeout(() => {
      this.data.counter--;
      this.setData({
        counter: this.data.counter
      })
      if (this.data.counter === 0) {
        this.data.counter = 60;
        this.setData({
          isGetSMS: true
        })
        return;
      }

      this.countdown();
    }, 1000)
  },

  login() {
    if (!this.data.phone && !this.data.verCode) {
      quick.showToastNone('信息有误，请确认填写完整！');
    }
    const data = {
      captchaType: this.data.captchaType,
      phone: this.data.phone,
      verCode: this.data.verCode,
      openId: app.globalData.openId,
      unionId: app.globalData.unionId
    }
    quick.requestPost({ url: "checkSmsCode" }, data).then(res => {
      const { code, data } = res.data;
      if (code === 0) {
        // 获取用户信息记录本地存储并
        const { openId, unionId } = app.globalData;
        wx.setStorage({
          key: 'userShowInfo',
          data: data,
          success: res => {
            app.globalData.userShowInfo = data;
            business.checkCertification();
            wx.switchTab({
              url: '/pages/index/index',
            })
          }
        })
      } else {
        quick.showToastNone('登录失败，验证码错误！')
      }
    })
  },

  // 获取图形验证码
  getCapCodeSrc() {
    if (app.globalData.openId == '') {
      setTimeout(() => {
        this.getCapCodeSrc();
      }, 100);
      return;
    }
    this.setData({
      capCodeSrc: util.getCapCodeSrc(app.globalData.openId)
    })
    
  }
})