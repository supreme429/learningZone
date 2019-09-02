//app.js
import ajax from './utils/ajax.js';
import $util from './utils/util.js';
import config from './utils/config.js';
import track from './utils/track.js';
const appInit = () => {
  Object.defineProperties(global, {
    'config': {
      value: config,
      writable: false,
      configurable: false
    },
    'util': {
      value: $util,
      writable: false,
      configurable: false
    },
    'ajax': {
      value: ajax,
      writable: false,
      configurable: false
    },
    'track': {
      value: track,
      writable: false,
      configurable: false
    }
  });
}
appInit();
App({
  onLaunch: function () {
    //随机字符
    if (!wx.getStorageSync('UUIDSSTR')){
      wx.setStorageSync('UUIDSSTR', $util.guid())
    }
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        let params = {
          'type': 1,
          'code': res.code
        }
        $util.userLogin(params)
      }
    })
    
  },

  /**
   * 设置定位信息
  */
  setRegionInfo: function(regionData) {
    let data = regionData || {};
    
    this.globalData.regionInfo = regionData;
  },

  /**
   * 获取定位信息
  */
  getRegionInfo: function() {
    return this.globalData.regionInfo;
  },

  /**
   * 检测用户是否授权了位置信息，如果未授权，则重新提示一次
  */
  checkLocationAuthorize: function(callback) {
    wx.getSetting({
      success: function(res) {

        let status = res.authSetting; 

        if (!status['scope.userLocation']) {

          wx.showModal({
            title: '是否授权当前位置',
            content: '该服务需要您的位置信息，请确认授权，否则无法使用',
            success: function(tip) {

              if (tip.confirm) {
                wx.openSetting({
                  success: function(data) {
                    if (data.authSetting['scope.userLocation']) {
                      callback(true);
                    }
                  }
                })
              } else {
                callback(false);
              }

            }
          })

        } else {
          callback(true);
        }
      }
    })
  },
/**
   * 检测用户是否调用getuserInfo授权
  */
  checkUserInfoAuthorize: function (callback){
    wx.getSetting({
      success: function (res) {

        let status = res.authSetting;
        console.log('授权状态',status)
        if (status['scope.userInfo']) {
          callback(true);
        } else {
          callback(false);
        }
      }
    })
  },
  globalData: {
    userInfo: null,
    hoverStayTime: 50, // navigator点击后保持hover状态时间
    // 用户位置信息，包括经纬度、城市、体验馆等信息，主要用于单品页面
    regionInfo: {},
    //domain: "https://sapi_test.meilele.com",//老测
    //Login_url:"https://mtest.meilele.com/",//老测
    //main_url:"https://test.meilele.com/"//老测
    domain: "https://sapi.meilele.com",//新测&正式环境
    Login_url: "https://m.meilele.com/",//新测&正式环境
    main_url: "https://www.meilele.com/",//老测&正式环境
    imagesUrl:'https://image.meilele.com',
    imagesUrl2: 'https://img002.meilele.com'
  }
})