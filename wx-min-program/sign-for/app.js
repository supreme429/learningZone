//app.js
const util = require('utils/util.js')
const appId = "wx6a41b1e9d754380c";
const env = 'pro';
const config = {
  // 生产环境
  pro: {
    baseUrl: 'https://www.mll3321.com/',
    proxy: 'wx-proxy-web',
    appNum: 10002,
  },
  // 测试环境
  test: {
    baseUrl: 'https://mllmtest.com/',
    proxy: 'wx',
  },
  // 开发环境
  dev: {
    baseUrl: 'https://mllo2o.com/',
    proxy: 'wx-proxy-web',
    appNum: 10002,
  }
};

App({
  onLaunch: function () {
  },

  onShow: function () {
    // 用户信息是否存在
    wx.getStorage({
      key: 'userInfo',
      success: res => {
        const userInfo = res.data;
        this.globalData.openId = userInfo.openId;
        this.globalData.sessionKey = userInfo.sessionKey;
        this.globalData.unionId = userInfo.unionId;
      },
      fail: () => {
        this.getOpenId();
      }
    })

    // 获取用户上一次离开时间
    try {
      var leaveTime = wx.getStorageSync('leaveTime')
      if (leaveTime) {
        this.globalData.leaveTime = leaveTime;
        this.globalData.isOverLoginoutTime = util.overTimeLimit(leaveTime, 24);
      }
    } catch (e) {
      this.globalData.isOverLoginoutTime = true;
    }
    this.initScanCodeInfo();
  },

  onHide: function () {
    this.setUserStatus();
  },

  globalData: {
    appId: appId,
    openId: '', // 用户小程序OPENID
    sessionKey: '',
    unionId: '', // UnionID
    wxPhone: '', // 微信手机号
    scenario: '', // 场景，用来判定是否进入后台设定离开字段的判定值
    leaveTime: '', // 离开的时间
    isOverLoginoutTime: false, // 是否超过登出时限 【24小时】
    isOnlining: true, // 是否一直处于在线状态，因为扫码等特殊场景会调用到app.onHide故加此字段以做标识

    // 扫码收货信息
    scanCodeRecevingInfo: {
      consigneePhone: '', // 收货人手机号
      consigneePhoneBak: '', // 备用收货人手机号
      deliveryNo: '', // 货运单号
      evaluateStatus: 0, // 评价状态（0：未评价，1：已评价）
    }
  },

  // 登录
  // 登录前需先去拿到openId
  getOpenId(callback) {
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (res.code) {
          //发起网络请求 获取 openId
          // https://mllo2o.com/wx-proxy-web/wxapp/{appid}/{code}
          wx.request({
            // url: 'https://mllo2o.com/wx-proxy-web/wxapp/10002/' + res.code,
            url: this.getRequestUrl(`wxapp/${config[env].appNum}/${res.code}`, config[env].proxy),
            data: {},
            success: res => {
              const resData = res.data
              if (resData.code !== 0) {
                wx.showToast({
                  title: '授权失败，请重新打开小程序',
                  icon: 'none',
                  duration: 2000,
                  mask: true
                })

                return;
              }

              // 设定openId, sessionKey, unionId
              if (resData.code == 0) {
                wx.setStorage({
                  key: 'userInfo',
                  data: {
                    openId: resData.data.openId,
                    sessionKey: resData.data.sessionkey,
                    unionId: resData.data.unionId,
                  },
                })
                this.globalData.openId = resData.data.openId;
                this.globalData.sessionKey = resData.data.sessionkey;
                this.globalData.unionId = resData.data.unionId;
              }

              // 回调手机绑定手机确认是否有绑定手机
              this.checkMinaOpenId(resData.data.openId, resData.data.unionId);

              // 回调手机绑定接口
              if (callback) {
                callback(this.globalData.openId)
              }
            },
            fail: err => {
              console.log('getOpenIdfail:', err);
            }
          })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    }) //重新登录
  },

  // 重组请求链接
  getRequestUrl(url, proName = 'signmina/mina') {
    return config[env].baseUrl + (proName ? proName + '/' : '') + url;
  },

  // GET 请求快捷方法
  requestGet(requectUrl, data) {
    console.log('接口传参：', requectUrl.url, data);
    return new Promise((resolve, reject) => {
      wx.request({
        url: this.getRequestUrl(requectUrl.url, requectUrl.proName),
        method: 'GET',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          if (reject) {
            reject(err);
          } else {
            wx.showToast({
              icon: 'none',
              title: '信息获取失败',
            });
            console.log(err);
          }
        }
      })
    })
  },

  // POST 请求快捷方法
  requestPost(requectUrl, data) {
    console.log('接口传参：', requectUrl.url, data);
    return new Promise((resolve, reject) => {
      wx.request({
        url: this.getRequestUrl(requectUrl.url, requectUrl.proName),
        method: 'POST',
        // header: { 'content-type': 'application/x-www-form-urlencoded' },
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          if (reject) {
            reject(err);
          } else {
            wx.showToast({
              icon: 'none',
              title: '信息获取失败',
            });
            console.log(err);
          }
        }
      })
    })
  },

  /**
   * 跳转到扫描页面【符合下面两个条件】
   * 条件1：离开时间超过24小时
   * 条件2：完成评价
   * 条件3：若一直未关闭小程序则不进行跳转
   */
  jumpScanCodeIndex() {
    const globalData = this.globalData;
    if (
      (globalData.isOverLoginoutTime || globalData.scanCodeRecevingInfo.evaluateStatus == 1) &&
     !globalData.isOnlining) {
      wx.setStorage({
        key: 'isOnlining',
        data: true
      })
      wx.redirectTo({
        url: '/pages/scanCodeReceiving/index/index',
      })
    } else {
      wx.setStorage({
        key: 'isOnlining',
        data: true
      })
    }
  },

  /**
   * 初始获取扫描收货单缓存数据
   */
  initScanCodeInfo() {

    // 微信手机号 wxPhone
    wx.getStorage({
      key: 'wxPhone',
      success: res => {
        this.globalData.wxPhone = res.data;
      },
      fail: err => {
        this.checkMinaOpenId(this.globalData.openId, this.globalData.unionId);
      }
    })

    // 收货单号 deliveryNo
    wx.getStorage({
      key: 'deliveryNo',
      success: res => {
        this.globalData.scanCodeRecevingInfo.deliveryNo = res.data;
      },
    })

    // 收货手机号 consigneePhone
    wx.getStorage({
      key: 'consigneePhone',
      success: res => {
        this.globalData.scanCodeRecevingInfo.consigneePhone = res.data;
      },
    })

    // 收货手机号 consigneePhone
    wx.getStorage({
      key: 'consigneePhone',
      success: res => {
        this.globalData.scanCodeRecevingInfo.consigneePhone = res.data;
      },
    })

    // 备用收货手机号 consigneePhoneBak
    wx.getStorage({
      key: 'consigneePhoneBak',
      success: res => {
        this.globalData.scanCodeRecevingInfo.consigneePhoneBak = res.data;
      },
    })

    // 获取评价状态
    wx.getStorage({
      key: 'evaluateStatus',
      success: res => {
        this.globalData.scanCodeRecevingInfo.evaluateStatus = res.data;
      },
      fail: () => {
        this.globalData.scanCodeRecevingInfo.evaluateStatus = 0;
      }
    })
  },

  // 设定会导致小程序进入后台的特殊场景
  setScenario(scenario) {
    this.globalData.scenario = scenario;
  },

  /**
   * 处理用户的让整入小程序进放后台时的事件
   * 设定leaveTime isOnlining
   */
  setUserStatus() {
    // 会触发app.onHide的特殊场景：scanCode|扫码; chooseFile|选择文件;
    const scenarios=['scanCode', 'chooseFile'];
    if (scenarios.indexOf(this.globalData.scenario) == -1) {
      wx.setStorage({
        key: 'leaveTime',
        data: new Date().getTime()
      });
      wx.setStorage({
        key: 'isOnlining',
        data: false
      })
    }
  },

  // 校验小程序openId与美乐乐账户绑定关系 
  checkMinaOpenId(openId, unionId) {
    if (!openId || !unionId) return;
    this.requestGet({ url: 'checkMinaOpenId'}, {
      openId: openId,
      unionId: unionId,
    }).then(res => {
      console.log('checkMinaOpenId：', res)
      const code = res.data.code;
      if(code === 0) {
        const data = JSON.parse(res.data.data);
        wx.setStorage({
          key: 'wxPhone',
          data: data.mobile,
        })

        this.globalData.wxPhone = data.mobile;
      }
    })
  },
  

  requestErrorToast(content = '信息获取失败' ) {
    wx.showToast({
      icon: 'none',
      title: content,
    });
  }
})