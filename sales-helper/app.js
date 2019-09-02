//app.js
const { config, appNum, env } = require('./config/config.js');
const quick = require('./utils/quick.js');
const { router } = require('./utils/router.js');
const business = require('./utils/business.js');

App({
  globalData: {
    switchTabPage: ["/pages/estimate/estimate", "/pages/history/history", "/pages/more/more"],
    appId: '',
    openId: '', // 用户小程序OPENID
    sessionKey: '',
    unionId: '', // UnionID
    userId: '', // 店长/员 id
    userRole: '', // 用户角色 1=店员，2=店长
    userName: '', // 店长/员 名字

    isPassFirstCheck: false, // 是否经过首次密码验证
    openFingerprint: false, // 是否开启指纹
    // 用户展示信息
    userShowInfo: null,
    leavePage: null, // 离开时的页面

    shareInfo: {
      title: '销售小助手',
      path: '/pages/index/index',
      imageUrl: '/images/img-share.jpg'
    },
    tipsData: {}
  },
  onLaunch() {
    this.getTipsData();
    this.globalData.appId = wx.getAccountInfoSync().miniProgram.appId;
  },
  onShow() {
    // 用户信息是否存在
    wx.getStorage({
      key: 'userInfo',
      success: res => {
        if (this.globalData.openId) return;
        const userInfo = res.data;
        this.globalData.openId = userInfo.openId;
        this.globalData.sessionKey = userInfo.sessionKey;
        this.globalData.unionId = userInfo.unionId;
      },
      fail: () => {
        this.getOpenId();
      }
    });

    // 获取本地的 user
    wx.getStorage({
      key: 'user',
      success: res => {
        this.globalData.userId = res.data.userId;
        this.globalData.userRole = res.data.userRole;
        this.globalData.userName = res.data.userName;
      },
    })
    
    this.checkLeaveTime();
  },
  onHide() {
    // 当小程序隐藏后，记录时间
    this.recordLeaveTime();
  },

  // 登录
  // 登录前需先去拿到openId
  getOpenId(callback) {
    wx.showLoading({
      title: '加载中...'
    });

    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (res.code) {
          //发起网络请求 获取 openId
          // https://mllo2o.com/wx-proxy-web/wxapp/{appid}/{code}
          wx.request({
            // url: 'https://mllo2o.com/wx-proxy-web/wxapp/10002/' + res.code,
            url: quick.getRequestUrl(`wxapp/${appNum}/${res.code}`, env.proxy),
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
                // 如果unionId 不存在，则手动getUserInfo授权请求
                // 存在则关闭loaing动画继续登录
                wx.setStorage({
                  key: 'userInfo',
                  data: {
                    openId: resData.data.openId,
                    sessionKey: resData.data.sessionkey,
                    unionId: resData.data.unionId,
                  }
                })
                this.globalData.openId = resData.data.openId;
                this.globalData.sessionKey = resData.data.sessionkey;
                this.globalData.unionId = resData.data.unionId;

                business.addUserInfo({
                  openId: resData.data.openId,
                  unionId: resData.data.unionId,
                });
              }

              // 回调
              if (typeof callback == 'function') {
                callback(this.globalData.openId)
              }
              wx.hideLoading();
            },
            fail: err => {
              console.log('getOpenIdFail:', err);
            }
          })
        } else {
          quick.showToast('加载失败...')
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    }) //重新登录
  },

  // 记录离开的时间
  recordLeaveTime() {
    const pages = getCurrentPages();
    const route = pages[pages.length - 1].__route__;
    if (route != 'pages/index/index' && route != 'pages/userNoExist/userNoExist') {
      this.globalData.leavePage = '/' + pages[pages.length - 1].__route__;
      this.globalData.leavePageOpts = pages[pages.length - 1].options;
    }
    console.log(pages, this.globalData.leavePage)
    wx.setStorageSync('leaveTime', new Date().getTime());
  },
  // 检测离开的时间
  checkLeaveTime() {
    wx.getStorage({
      key: 'leaveTime',
      success: (res) => {
        // 如果离开时间大于5分钟则重新验证
        if (new Date().getTime() - res.data > 5 * 60 * 1000 && this.globalData.leavePage != router('index')) {
          console.log(this.globalData.leavePage);
          wx.reLaunch({
            url: router('index'),
          })
          wx.removeStorage({ key: 'leaveTime' });
        }
      },
    })
  },

  goPreLeavaPage() {
    let leavePage = this.globalData.leavePage;
    if (!leavePage) return;
    let leavePageOptsStr = this.handleLeavePageOpts();
    leavePage += '?' + leavePageOptsStr;
    if (this.globalData.switchTabPage.indexOf(this.globalData.leavePage) > -1) {
      wx.switchTab({
        url: leavePage,
        success: () => {
          this.globalData.leavePage = '';
          this.globalData.leavePageOpts = null;
        }
      })
    } else {
      wx.redirectTo({
        url: leavePage,
        success: () => {
          this.globalData.leavePage = '';
          this.globalData.leavePageOpts = null;
        }
      })
    }
    console.log('goleavePage:', this.globalData.switchTabPage, this.globalData.leavePage)
  },

  handleLeavePageOpts() {
    let leavePageOpts = this.globalData.leavePageOpts;
    let leavePageOptsStr = '';
    if (this.globalData.leavePageOpts) {
      for (let k in leavePageOpts) {
        leavePageOptsStr += `${k}=${leavePageOpts[k]}&`
      }
    }

    return leavePageOptsStr;
  },

  getTipsData() {
    quick.requestGet({ url: 'getTipsData' }).then(res => {
      let { code, data } = res.data;
      if (code === 0) {
        this.globalData.tipsData = data;
      }
    })
  }
})