// pages/more/more.js
const app = getApp();
const { config, env } = require('../../config/config.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 扫描后的图层信息（二维码无效、礼品已抢光、核销成功但未匹配到手机号码）
    scanMsg: {
      icon: 'ok',
      title: '无效的二维码',
      note: '请核实二维码是否正确'
    },

    // 扫描器控制变量
    hide_step_scanner: false,

    // step控制变量
    hide_step_container: true,
    // step icon控制变量
    step_success_icon: false,

    // 手机校验控制变量
    hide_checkoutPhone_container: true,
    // 图形验证码连接地址
    imgCaptchaUrl: 'https://static.mllres.com/base/i/blank.gif',
    // 输入的图形验证码
    imgCode: '',
    // 手机号
    phone: '',
    // 输入的短信验证码
    smsCode: '',
    // 验证码类型
    captchaType: 'couponUse',

    // 发送短信验证码控制文字
    smsCaptchaText: '发送短信校验码',

    // 锁定发送短信按钮
    isLockGetSmsCodeBtn: false,

    // 锁定手机号码校验按钮
    isLockCheckoutPhoneBtn: false,

    // 核销成功的控制变量
    hide_verificationSuccess_container: true,
    // 昵称
    nickName: '',
    // 体验馆id
    exprId: '',
    // 返回的手机号码
    mobile: '',

    // 券码
    couponSn: '',
    // 活动url
    activityUrl: '',
    //礼品名称
    giftName: '',

    openId: '',

    /* 弹出图层 */
    layer_visiblity: true,

    ecsid: '',
    // 核销接口切换
    switchInterface: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    
  },

  /**
   * 点击调用扫码api
   */
  bindScanEvent: function() {
    wx.scanCode({
      success: (res) => {
        console.log('scan:');
        console.log(res);
        if (!res.result) {
          this.data.scanMsg = {
            icon: 'warn',
            title: '无效的二维码',
            note: '请核实二维码是否正确'
          }
          this.setData({
            scanMsg: this.data.scanMsg
          });
          this.openLayer();
        } else {
          // 如果卡券码存在，则获取信息
          let couponRes = res.result;
          if (/coupon\:/.test(couponRes)) {
            let coupon = couponRes.split(':');
            let couponSn = coupon[1];
            this._getRelationInfo(couponSn);
            this.data.couponSn = couponSn || 'ce4mnsxi';
            this.data.switchInterface = 'bindCheckoutPhoneEvent'
            console.log(this.data.switchInterface)
            this.setData({
              couponSn: this.data.couponSn,
              switchInterface: this.data.switchInterface
            });
          }
          // 新活动
          else if (/(http|https):\/\/weixin.qq([\w.]+\/?)\S*/.test(couponRes)) {
            console.log('新活动', couponRes)
            this.data.switchInterface = 'activityCheckPhone'
            console.log(this.data.switchInterface)
            this.setData({
              activityUrl: this.data.activityUrl,
              switchInterface: this.data.switchInterface
            });
            
            this.data.hide_step_scanner = true;
            this.data.hide_step_container = false;
            this.data.hide_checkoutPhone_container = false;
            this.data.hide_verificationSuccess_container = true;

            this.setData({
              hide_step_scanner: this.data.hide_step_scanner,
              hide_step_container: this.data.hide_step_container,
              hide_checkoutPhone_container: this.data.hide_checkoutPhone_container,
              hide_verificationSuccess_container: this.data.hide_verificationSuccess_container,
            });

            this.getImgCaptcha();
            wx.setStorageSync('phone', this.data.mobile);
            wx.setStorageSync('openId', this.data.openId);
          }
          else {
            // 如果返回的卡券码不是coupon:ce4mnsxi这种格式的，则认为是无效的
            this.data.scanMsg = {
              icon: 'warn',
              title: '无效的二维码',
              note: '请核实二维码是否正确'
            }
            this.setData({
              scanMsg: this.data.scanMsg
            });
            this.openLayer();
          }
        }
      }
    });
  },

  /**
   * on show
   */
  onShow: function() {
    
  },

  /**
   * ready
   */
  onReady: function() {
    /*this.data.hide_step_container = false;
    this.data.hide_checkoutPhone_container = false;
    this.data.hide_verificationSuccess_container = true;

    this.setData({
      hide_step_container: this.data.hide_step_container,
      hide_checkoutPhone_container: this.data.hide_checkoutPhone_container,
      hide_verificationSuccess_container: this.data.hide_verificationSuccess_container
    });
    this.getImgCaptcha();*/
  },

  /**
   * 根据券码获取相关信息
   */
  _getRelationInfo: function(couponSn) {
    let userInfo = wx.getStorageSync('user');
    let userId = userInfo && userInfo.userId;

    wx.request({
      url: `${env.pc}/dubbo_api/mll/crmImport/couponInfo?sn=${couponSn}&userId=${userId}`,
      method: 'GET',
      dataType: 'json',
      success: (res) => {
        console.log(res)
        switch (res.data.error) {
          case 0:
            this.data.hide_step_scanner = true;
            this.data.hide_step_container = true;
            this.data.hide_checkoutPhone_container = true;
            this.data.hide_verificationSuccess_container = false;
            this.data.nickName = res.data.data.name;
            this.data.exprId = res.data.data.exprId;
            this.data.mobile = res.data.data.mobile;
            this.data.openId = res.data.data.openid;
    
            this.setData({
              hide_step_scanner: this.data.hide_step_scanner,
              hide_step_container: this.data.hide_step_container,
              hide_checkoutPhone_container: this.data.hide_checkoutPhone_container,
              hide_verificationSuccess_container: this.data.hide_verificationSuccess_container,
              nickName: this.data.nickName,
              exprId: this.data.exprId,
              mobile: this.data.mobile,
              openId: this.data.openId
            });
            console.log('扫码结果0：');
            console.log(res);
            console.log(`openid:${this.data.openId}`);
            wx.setStorageSync('phone', this.data.mobile);
            wx.setStorageSync('openId', this.data.openId);
    
            break;
          case 1:
            this.data.hide_step_scanner = false;
            this.data.hide_step_container = true;
            this.data.hide_checkoutPhone_container = true;
            this.data.hide_verificationSuccess_container = true
    
            this.setData({
              hide_step_scanner: this.data.hide_step_scanner,
              hide_step_container: this.data.hide_step_container,
              hide_checkoutPhone_container: this.data.hide_checkoutPhone_container,
              hide_verificationSuccess_container: this.data.hide_verificationSuccess_container
            });
            wx.showModal({
              title: '',
              content: res.data.msg,
              showCancel: false,
              confirmText: '确定'
            });
            break;
          case 2:
            this.data.hide_step_scanner = false;
            this.data.hide_step_container = true;
            this.data.hide_checkoutPhone_container = true;
            this.data.hide_verificationSuccess_container = true;
    
            this.data.scanMsg = {
              icon: 'warn',
              title: '无效的二维码',
              note: '请核实二维码是否正确'
            }
    
            this.setData({
              hide_step_scanner: this.data.hide_step_scanner,
              hide_step_container: this.data.hide_step_container,
              hide_checkoutPhone_container: this.data.hide_checkoutPhone_container,
              hide_verificationSuccess_container: this.data.hide_verificationSuccess_container,
              scanMsg: this.data.scanMsg
            });
            this.openLayer();
            break;            
          case 3: 
            this.data.hide_step_scanner = true;
            this.data.hide_step_container = false;
            this.data.hide_checkoutPhone_container = false;
            this.data.hide_verificationSuccess_container = true;
            this.data.exprId = res.data.data.exprId;
            this.data.nickName = res.data.data.name;
            this.data.openId = res.data.data.openid;
    
            this.setData({
              hide_step_scanner: this.data.hide_step_scanner,
              hide_step_container: this.data.hide_step_container,
              hide_checkoutPhone_container: this.data.hide_checkoutPhone_container,
              hide_verificationSuccess_container: this.data.hide_verificationSuccess_container,
              nickName: this.data.nickName,
              exprId: this.data.exprId,
              openId: this.data.openId
            });
            this.getImgCaptcha();
            console.log('扫码结果3：');
            // console.log(res);
            console.log(`openid:${this.data.openId}`);
            wx.setStorageSync('phone', this.data.mobile);
            wx.setStorageSync('openId', this.data.openId);
            wx.setStorageSync('openId', this.data.openId);
            break;
          case 4:
            this.data.hide_step_scanner = false;
            this.data.hide_step_container = true;
            this.data.hide_checkoutPhone_container = true;
            this.data.hide_verificationSuccess_container = true;
    
            this.data.scanMsg = {
              icon: 'warn',
              title: '核销成功',
              note: '暂未匹配到用户~'
            }
    
            this.setData({
              hide_step_scanner: this.data.hide_step_scanner,
              hide_step_container: this.data.hide_step_container,
              hide_checkoutPhone_container: this.data.hide_checkoutPhone_container,
              hide_verificationSuccess_container: this.data.hide_verificationSuccess_container,
              scanMsg: this.data.scanMsg
            });
            this.openLayer();
            break;
        }
      }
    })
  },
  /**
   * 获取图形验证码
   */
  getImgCaptcha: function() {
    let uuid = 'j' + this._uuid(39);
    this.data.ecsid = uuid;

    // 去uuid 的前32位获取图形验证码
    let ecsid = uuid.substr(0, 32);

    let t = new Date().getTime()
    var url = `${env.pc}/solr_api/captcha/getCaptcha.do?t=${t}&ecsId=${ecsid}`;
    
    this.data.imgCaptchaUrl = url;
    this.setData({
      ecsid: this.data.ecsid,
      imgCaptchaUrl: this.data.imgCaptchaUrl
    });
  },

  /**
   * 获取输入的图形验证码
   */
  getInputImgCode: function(e) {
    this.data.imgCode = e.detail.value;
    this.setData({
      imgCode: this.data.imgCode
    });
  },

  /**
   * 获取输入的短信验证码
   */
  getInputSmsCode: function (e) {
    this.data.smsCode = e.detail.value;
    this.setData({
      smsCode: this.data.smsCode
    });
  },

  /**
   * 获取输入的手机号码
   */
  getInputPhone: function (e) {
    this.data.phone = e.detail.value;
    this.setData({
      phone: this.data.phone
    });
  },

  /**
   * 获取短信验证码
   */
  getSmsCaptcha: function() {
    let phone = this.data.phone;
    let imgCode = this.data.imgCode;

    if (this.data.isLockGetSmsCodeBtn) {
      return;
    }

    if (!/^1\d{10}$/.test(phone)) {
      wx.showToast({
        icon: 'none',
        title: '手机号码不正确',
        duration: 2000
      });
      return false;
    }

    if (imgCode.length < 4) {
      wx.showToast({
        icon: 'none',
        title: '图形验证码不正确',
        duration: 2000
      });
      return false;
    }

    var wait = 120;
    var countDown = () => {
      if (wait == 0) {
        this.data.isLockGetSmsCodeBtn = false;
        this.data.smsCaptchaText = '获取短信验证码';
        this.setData({
          smsCaptchaText: this.data.smsCaptchaText,
          isLockGetSmsCodeBtn: this.data.isLockGetSmsCodeBtn
        });        
        wait = 120;
      } else {
        this.data.isLockGetSmsCodeBtn = true;
        this.data.smsCaptchaText = '(' + wait + '秒)后重发';
        this.setData({
          smsCaptchaText: this.data.smsCaptchaText,
          isLockGetSmsCodeBtn: this.data.isLockGetSmsCodeBtn
        });
        wait--;
        setTimeout(function () {
          countDown()
        }, 1000);
      }
    }

    this.data.isLockGetSmsCodeBtn = true;

    wx.request({
      url: `${env.pc}/solr_api/captcha/mobileCaptcha/create_send_check_captcha.do?captchaType=${this.data.captchaType}&phoneNumber=${phone}&captcha=${imgCode}&crmSendType=123&crmSendFrom=7`,
      header: {
        'Cookie': `ECS_ID=${this.data.ecsid}`
      },
      method: 'GET',
      dataType: 'json',
      success: (res) => {
        if (res.data.error == 0) {
          wx.showToast({
            title: '短信发送成功',
          });
          countDown();
        } else {
          wx.showModal({
            title: '',
            content: res.data.msg,
            showCancel: false,
            confirmText: '确定'
          });

          this.data.isLockGetSmsCodeBtn = false;
          this.setData({
            isLockGetSmsCodeBtn: this.data.isLockGetSmsCodeBtn
          });  
        }
      }
    })
  },

  // 新活动手机号码核销
  activityCheckPhone: function() {
    if (this.data.isLockCheckoutPhoneBtn) {
      return;
    }

    let phone = this.data.phone;
    let smsCode = this.data.smsCode;
    let userid = wx.getStorageSync('user').userId;

    if (!/^1\d{10}$/.test(phone)) {
      wx.showToast({
        icon: 'none',
        title: '手机号码不正确',
        duration: 2000
      });
      return false;
    }
    if (!/\d{6}/.test(smsCode)) {
      wx.showToast({
        icon: 'none',
        title: '短信验证码有误',
        duration: 2000
      });
      this.data.smsCode = ''
      this.data.isLockCheckoutPhoneBtn = false;
      this.setData({
        smsCode: this.data.smsCode
      })
      return false;
    }

    this.data.isLockCheckoutPhoneBtn = true;
    // 新活动的校验接口
    wx.request({
      url: `${env.pc}/add_cart/?step=getAndSubmitCouponOrder&mobile=${phone}&captcha=${smsCode}&captchaType=${this.data.captchaType}&service_user_id=${userid}`,
      method: 'GET',
      dataType: 'json',
      success: (res) => {
        console.log(res)
        console.log(res.data.code)
        if (res.data.code == 0) {
          if (res.data.data.fromRegist == 1) {
            this.data.hide_step_scanner = true;
            this.data.hide_step_container = true;
            this.data.step_success_icon = true;
            this.data.hide_checkoutPhone_container = true;
            this.data.hide_verificationSuccess_container = true;

            this.data.scanMsg = {
              icon: 'warn',
              title: '核销成功',
              note: '暂未匹配到用户~'
            }

            this.setData({
              hide_step_scanner: this.data.hide_step_scanner,
              hide_step_container: this.data.hide_step_container,
              hide_checkoutPhone_container: this.data.hide_checkoutPhone_container,
              hide_verificationSuccess_container: this.data.hide_verificationSuccess_container,
              scanMsg: this.data.scanMsg
            });
            this.openLayer();
          } else {
            this.data.hide_step_container = true;
            this.data.hide_checkoutPhone_container = true;
            this.data.hide_verificationSuccess_container = false;
            this.data.step_success_icon = true;
            this.data.nickName = res.data.data.name;
            this.data.mobile = res.data.data.mobile;
            this.data.giftName = res.data.data.giftName;

            this.setData({
              hide_step_container: this.data.hide_step_container,
              hide_checkoutPhone_container: this.data.hide_checkoutPhone_container,
              hide_verificationSuccess_container: this.data.hide_verificationSuccess_container,
              step_success_icon: this.data.step_success_icon,
              nickName: this.data.nickName,
              mobile: this.data.mobile,
              giftName: this.data.giftName
            });
          }

          // 20190821 crm添加 传入exprId
          // 20190826 新活动接口添加exprId
          this._importCrm(phone, smsCode, res.data.data.exprId);

          wx.setStorageSync('phone', phone);
        } else {
          wx.showModal({
            title: '',
            content: res.data.msg,
            showCancel: false,
            confirmText: '确定'
          });
          this.data.smsCode = ''
          this.data.isLockCheckoutPhoneBtn = false;
          this.setData({
            smsCode: this.data.smsCode
          })

          if (res.data.data.canSubmit == 1) {
            // 20190826 新活动接口添加exprId
            this._importCrm(phone, smsCode, res.data.data.exprId);
          }

          return false;
        }
      },
      error: function () {
        wx.showToast({
          icon: 'none',
          title: '发生错误，请稍后再试',
          duration: 3000
        })
      }
    })
  },
  /**
   * 手机号码校验(核销)
   */
  bindCheckoutPhoneEvent: function(e) {
    if (this.data.isLockCheckoutPhoneBtn) {
      return;
    }

    let couponSn = this.data.couponSn;
    let phone = this.data.phone;
    let smsCode = this.data.smsCode;
    let userid = wx.getStorageSync('user').userId;

    if (!/^1\d{10}$/.test(phone)) {
      wx.showToast({
        icon: 'none',
        title: '手机号码不正确',
        duration: 2000
      });
      return false;
    }
    if (!/\d{6}/.test(smsCode)) {
      wx.showToast({
        icon: 'none',
        title: '短信验证码有误',
        duration: 2000
      });
      this.data.smsCode = ''
      this.data.isLockCheckoutPhoneBtn = false;
      this.setData({
        smsCode: this.data.smsCode
      })
      return false;
    }

    this.data.isLockCheckoutPhoneBtn = true;

    wx.request({
      url: `${env.pc}/add_cart/?step=submitCouponOrder&couponSn=${couponSn}&mobile=${phone}&captcha=${smsCode}&captchaType=${this.data.captchaType}&username=${this.data.nickName}&expr_id=${this.data.exprId}&open_id=${this.data.openId}&service_user_id=${userid}`,
      method: 'GET',
      dataType: 'json',
      success: (res) => {
        console.log('checkout:');
        console.log(res);
        if (res.data.code == 0) {
          if (res.data.data.fromRegist == 1) {
            this.data.hide_step_scanner = true;
            this.data.hide_step_container = true;
            this.data.hide_checkoutPhone_container = true;
            this.data.hide_verificationSuccess_container = true;

            this.data.scanMsg = {
              icon: 'warn',
              title: '核销成功',
              note: '暂未匹配到用户~'
            }

            this.setData({
              hide_step_scanner: this.data.hide_step_scanner,
              hide_step_container: this.data.hide_step_container,
              hide_checkoutPhone_container: this.data.hide_checkoutPhone_container,
              hide_verificationSuccess_container: this.data.hide_verificationSuccess_container,
              scanMsg: this.data.scanMsg
            });
            this.openLayer();
          } else {
            this.data.hide_step_container = true;
            this.data.hide_checkoutPhone_container = true;
            this.data.hide_verificationSuccess_container = false;
            this.data.step_success_icon = true;
            this.data.nickName = res.data.data.name;
            this.data.mobile = res.data.data.mobile;

            this.setData({
              hide_step_container: this.data.hide_step_container,
              hide_checkoutPhone_container: this.data.hide_checkoutPhone_container,
              hide_verificationSuccess_container: this.data.hide_verificationSuccess_container,
              step_success_icon: this.data.step_success_icon,
              nickName: this.data.nickName,
              mobile: this.data.mobile
            });
          }

          wx.setStorageSync('phone', phone);

          // 20190821 crm添加 传入exprId
          this._importCrm(phone, smsCode, this.data.exprId);
        } else {
          wx.showModal({
            title: '',
            content: res.data.msg,
            showCancel: false,
            confirmText: '确定'
          });
          this.data.smsCode = ''
          this.data.isLockCheckoutPhoneBtn = false;
          this.setData({
            smsCode: this.data.smsCode
          })

          if (res.data.data.canSubmit == 1) {
            this._importCrm(phone, smsCode, this.data.exprId);
          }

          return false;
        }
      },
      error: function () {
        wx.showToast({
          icon: 'none',
          title: '发生错误，请稍后再试',
          duration: 3000
        })
      }
    })
  },

  /**
   * uuid 生成加密串，代替ecsid
   */
  _uuid: function(len, radix) {
    var chars = '0123456789abcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [], i;
    radix = radix || chars.length;

    if(len) {
      for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
    } else {
      var r;
      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
      uuid[14] = '4';

      for(i = 0; i < 36; i++) {
        if (!uuid[i]) {
          r = 0 | Math.random() * 16;
          uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
        }
      }
    }

    return uuid.join('');
  },

  /**
   * crm
   */
  _importCrm: function(phone, captcha, arrivedExprId) {
    // 20190822 增加guider参数
    let guider = wx.getStorageSync('user').userName
    console.log('import crm:');
    console.log(`${env.crm}/mllCRM/customerController.do?
      addCustInfo
      &mobile=${phone}
      &openId=${this.data.openId}
      &type=1
      &verifiedStatus=1
      &arrivedExprId=${arrivedExprId}
      &guider=${guider}`);
    wx.request({
      url: `${env.crm}/mllCRM/customerController.do?addCustInfo&mobile=${phone}&openId=${this.data.openId}&type=1&verifiedStatus=1&arrivedExprId=${arrivedExprId}&guider=${guider}`,
      method: 'POST',
      dataType: 'json'
    })
  },

  /**
   * 跳转到用户信息页面
   */
  jumpToUserPage: function() {
    wx.navigateTo({
      url: '/pages/user/user'
    })
  },





  /**
   * 打开图层 
  */
  openLayer: function () {
    this.data.layer_visiblity = false;

    this.setData({
      layer_visiblity: this.data.layer_visiblity
    })
  },

  /**
   * 关闭图层
  */
  closeLayer: function () {
    this.data.layer_visiblity = true;

    this.setData({
      layer_visiblity: this.data.layer_visiblity
    })

    wx.switchTab({
      url: '/pages/more/more'
    });
  }
})