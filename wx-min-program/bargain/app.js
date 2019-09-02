//app.js
const quick = require('./utils/quick.js');
const business = require('./utils/business.js');
const { config, appId, appNum, env } = require('./config/config.js');

App({
  globalData: {
    appId: appId,
    openId: '', // 用户小程序OPENID
    sessionKey: '',
    unionId: '', // UnionID
    wxPhone: '', // 微信手机号
    // 用户展示信息
    userShowInfo: null,
    /* {
       headerUrl: '',
       nickName: '',
    } */
    // 活动地址
    activitiesAddress: null,
    minaShareInfo: null,  //小程序分享信息
    waiteShareGoods: null,  //从砍价详情回到其他页面提示首次分享弹框配置
    /**
     * {
     * toggleFirstShareDialog: false: 不显示， true：显示
     * goodsSn: '',
     * goodsSkuSn:'',
     * brUuid: '',
     * shareConfig:{
     *    title:'',
     *    url:'',
     *    imageUrl:''
     *  }
     * }
     */
  },

  onLaunch() {
    this.globalData.appId = config.appId;
  },

  onShow() {
    // 检测网络状况
    business.getNetwordType();
    // 打开小程序预先获取地理位置
    business.getLocation(this);
    // 用户信息是否存在
    wx.getStorage({
      key: 'userInfo',
      success: res => {
        const userInfo = res.data;
        this.globalData.openId = userInfo.openId;
        this.globalData.sessionKey = userInfo.sessionKey;
        this.globalData.unionId = userInfo.unionId;
        this.getUserShowInfo(userInfo.openId);
      },
      fail: () => {
        this.getOpenId();
      }
    })
    //获取小程序分享信息
    business.getBargainMinaShareInfo(this)
  },

  //记录当前查看砍价详情商品是否已首次分享
  isFirstShareData:{
    goodsId: ''
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
                this.getUserShowInfo(resData.data.openId);
              }


              // 回调手机绑定手机确认是否有绑定手机
              // this.checkMinaOpenId(resData.data.openId, resData.data.unionId);
              // 新增用户信息
              business.addUserInfo({ appId: this.globalData.appId, openId: resData.data.openId, unionId: resData.data.unionId });
              // 回调手机绑定接口
              if (typeof callback == 'function') {
                callback(this.globalData.openId)
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
  getUserShowInfo(openId) {
    const setUserInfo = data => {
      this.globalData.userShowInfo = data;
    };
    wx.getStorage({
      key: 'userShowInfo',
      success: res => {
        setUserInfo(res.data);
      },
      fail: err => {
        // request 获取头像和昵称
        quick.requestGet({
          url: 'getUserInfo'
        }, {
            appId,
            openId: this.globalData.openId
        }).then(res => {
          const { code, data } = res.data;
          
          if (code === 0 && data.headImgUrl && data.nickName) {
            wx.setStorage({
              key: 'userShowInfo',
              data: {
                headImgUrl: data.headImgUrl,
                nickName: data.nickName
              },
            });
            this.globalData.userShowInfo = data;
          }
        })
      }
    })
  },

  // 获取活动地址
  getActivitiesAddress(data, callback) {
    const setActivitiesAddress = data => {
      this.globalData.activitiesAddress = data;
    }
    if (data) {
      wx.setStorage({
        key: 'activitiesAddress',
        data: data,
        success: () => {
          setActivitiesAddress(data);

          if (typeof callback == 'function') {
            callback();
          }
        }
      });
    } else {
      wx.getStorage({
        key: 'activitiesAddress',
        success: res => {
          setActivitiesAddress(res.data);

          if (typeof callback == 'function') {
            callback();
          }
        }
      })
    }
  },
})