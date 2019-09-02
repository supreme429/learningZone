const app = getApp();
const quick = require('../../utils/quick.js');
const { router } = require('../../utils/router.js');
const  { Base64 } = require('../../libs/base64js.js');

Page({
  data: {
    globalData: null,
    password: '', // 登录密码
    captchaCode: '', // 验证码
    showWXLogin: false, // 是否显示微信登录
    showPwdLogin: false, // 显示密码登录
    showFingerprintLogin: false, // 显示指纹登录
    cancelFingerprintLogin: false, // 取消指纹验证
    isSupperFingerPrint: false, // 是否支持指纹

    captchaImgUrl: '',
  },
  onLoad: function () {
    const globalData = app.globalData;
    this.checkIsSupportSoterAuthentication(() => {
      // 二次验证进入
      if (globalData.isPassFirstCheck && globalData.openFingerprint) {
        console.log('二次进入');
        this.startSoterAuthentication();
      }
    });
    this.init();
    console.log('指纹显示：', this.data.isSupperFingerPrint, app.globalData.isPassFirstCheck, app.globalData.openFingerprint)
  },

  onShareAppMessage() {
    return app.globalData.shareInfo
  },

  init() {
    if(!app.globalData.openId) {
      setTimeout(() => { this.init() }, 300);
      return;
    }
    let setData = { globalData: app.globalData };
    this.showLoginPage(setData);
  },

  // 登录方式展示逻辑
  showLoginPage(setData = {}) {
    // 未有 unionId 使用 getUserInfo 手动获取
    if (!app.globalData.unionId) {
      setData.showWXLogin = true;
      setData.showPwdLogin = false;
      setData.showFingerprintLogin = false;
    } else if (!app.globalData.isPassFirstCheck || this.data.cancelFingerprintLogin || !app.globalData.openFingerprint) { // 首次进行密码认证 || 取消指纹登录 || 未开启指纹验证
      setData.showWXLogin = false;
      setData.showPwdLogin = true;
      setData.showFingerprintLogin = false;

      this.refreshCaptcha();
    } else {
      setData.showWXLogin = false;
      setData.showPwdLogin = false;
      setData.showFingerprintLogin = true;
    }
    this.setData(setData);
  },

  // 开启指纹
  openFingerprint() {
    wx.showModal({
      content: '下次登录是否开启指纹登录',
      success: res => {
        if (res.confirm) {
          this.checkIsSoterEnrolledInDevice((res) => {
            if (res.isEnrolled) {
              app.globalData.openFingerprint = true;
              this.setData({
                globalData: app.globalData
              })
            } else {
              quick.showToastNone('请先录入指纹信息');
            }
          });
        }
      }
    })
  },

  // 取消指纹
  cancelFingerprint() {
    this.data.cancelFingerprintLogin = true;
    this.showLoginPage();
  },

  // 密码登录
  /**
   * checkUser接口
      code：
      0 校验用户信息成功，返回用户信息
      1 请求失败
      1000 验证码错误
      1002 用户信息不存在
      1003 密码错误
   */
  login() {
    if (!this.data.password) {
      quick.showToastNone('请输入密码！');
      return;
    }
    if (!this.data.captchaCode) {
      quick.showToastNone('请输入验证码！');
      return;
    }
    quick.requestPost({ url: 'checkUser' }, { unionId: app.globalData.unionId, password: Base64.encode(this.data.password + this.data.captchaCode) })
      .then(res => {
        let { code, data } = res.data;
        // 无信息跳转到错误页面
        if(code === 0) {
          data = JSON.parse(data);
          app.globalData.userId = data.userId;
          app.globalData.userName = data.userName;
          app.globalData.userRole = data.type; // 1=店员，2=店长
          app.globalData.isPassFirstCheck = true;
          wx.setStorage({
            key: 'user',
            data: {
              userId: data.userId,
              userName: data.userName,
              userRole: data.type
            },
          })
          if (app.globalData.leavePage) {
            app.goPreLeavaPage();
          } else {
            wx.switchTab({
              url: router('estimate'),
            });
          }
        } else if (code === 1000) {
          quick.showToastNone('验证码错误!');
        } else if (code === 1003) {
          quick.showToastNone('密码错误！');
        } else if (code === 1002) {
          wx.navigateTo({
            url: router('userNoExist'),
          });
        } else {
          quick.showToastNone('请求失败，请稍后再试');
        }
      })
  },
  // 检查设备是否支持指纹
  checkIsSupportSoterAuthentication(callback) {
    wx.checkIsSupportSoterAuthentication({
      success: res => {
        if (res.supportMode.indexOf('fingerPrint') > -1) {
          this.setData({
            isSupperFingerPrint: true
          })
          callback();
        }
      }
    })
  },

  // 检查设备内是否录入指纹
  checkIsSoterEnrolledInDevice(callback) {
    wx.checkIsSoterEnrolledInDevice({
      checkAuthMode: 'fingerPrint',
      success: res => {
        callback(res)
      }
    })
  },

  // 开始指纹认证 
  startSoterAuthentication() {
    
    this.checkIsSoterEnrolledInDevice(res => {
      if (res.isEnrolled) {
        wx.startSoterAuthentication({
          requestAuthModes: ['fingerPrint'],
          challenge: 'marz',
          authContent: '请用指纹解锁',
          success(res) {
            console.log('请用指纹解锁leavePage:', app.globalData.leavePage)
            if(res.errCode === 0) {
              if(app.globalData.leavePage) {
                app.goPreLeavaPage();
              } else {
                wx.switchTab({
                  url: router('estimate'),
                });
              }
            } else {
              quick.showToastNone('指纹识别失败，请用密码登录！')
            }
          },
          fail(err) {
            console.log('err:', err)
          }
        });
      }
    })
  },
  // 关闭微信登录
  closeWxLogin() {
    this.showLoginPage();
  },

  // 刷新验证码
  refreshCaptcha() {
    this.setData({
      captchaImgUrl: quick.getRequestUrl('ntpl/code/captcha-image', 'shmina') + `?unionId=${app.globalData.unionId}&t=${new Date().getTime()}`,
    })
  },

  // 
  ipnutValue(e) {
    const { field } = e.currentTarget.dataset;
    this.data[field] = e.detail.value;
  }
})
