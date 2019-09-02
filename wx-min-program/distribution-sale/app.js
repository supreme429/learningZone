//app.js
const quick = require('./utils/quick.js');
const business = require('./utils/business.js');
const env = 'dev';
const config = {
  // 生产环境
  pro: {
    baseUrl: 'https://www.mll3321.com/',
    proxy: 'wx-proxy-web',
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
  }
};


App({
  globalData: {
    isCertification: false, // 用户是否通过认证
    openId: '', // 用户小程序OPENID
    sessionKey: '',
    unionId: '', // UnionID
    // 用户展示信息
    userShowInfo: null,
    /* {
       userId: '', // 分销商ID
       mobile: '',  // 用户手机号【存在即代表已登录】
       headUrl: '',
       name: '',
    } */
  },

  onShow: function() {
    wx.getStorage({
      key: 'userInfo',
      success: res => {
        const userInfo = res.data;
        this.globalData.openId = userInfo.openId;
        this.globalData.sessionKey = userInfo.sessionkey;
        this.globalData.unionId = userInfo.unionId;
        this.getUserShowInfo(userInfo);
      },
      fail: (err) => {
        this.getOpenId(this.getUserShowInfo);
      }
    })
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
            // url: 'https://mllo2o.com/wx-proxy-web/wxapp/10003/' + res.code,
            url: this.getRequestUrl(`wxapp/10003/${res.code}`, config[env].proxy),
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
                console.log('getOpenId:', this.globalData)
                console.log('app:', new Date().getTime())
              }

              // 回调手机绑定接口
              if (typeof callback == 'function') {
                callback(resData.data)
              }
            },
            fail: err => {
              console.log('getOpenIdFail:', err);
            }
          })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    }) //重新登录
  },

  // 获取用户信息
  getUserShowInfo(userInfo) {
    const setUserInfo = data => {
      this.globalData.userShowInfo = data;
    };
    wx.getStorage({
      key: 'userShowInfo',
      success: res => {
        this.globalData.userShowInfo = res.data;
        business.checkCertification();
      },
      fail: err => {
        // 未登录过则查询该openId用户是否有在美乐乐后台注册过
        const data = { openId: userInfo.openId, unionId: userInfo.unionId };
        quick.requestGet({ url: 'checkMinaOpenId' }, data).then(res => {
          const { code, data } = res.data;
          if (code === 0) {
            setUserInfo(JSON.parse(data));
            wx.setStorage({
              key: 'userShowInfo',
              data: JSON.parse(data),
              success: res => {
                business.checkCertification();
                wx.switchTab({
                  url: '/pages/index/index',
                })
              }
            })
          }
        })
      }
    })
  },

  // 重组请求链接
  getRequestUrl(url, proName = 'damina/mina') {
    return config[env].baseUrl + (proName ? proName + '/' : '') + url;
  },
})