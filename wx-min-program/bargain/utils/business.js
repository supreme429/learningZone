/**
 * 存放公用的业务逻辑
 */
const quick = require('./quick.js');
const util = require('./util.js');
const { langs } = require('./langs.js');
const getNetwordType = () => {
  wx.onNetworkStatusChange(function (res) {
    console.log('getNetwordType:', res)
    // 返回网络类型, 有效值：
    // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
    if (res.networkType === 'none') {
      wx.navigateTo({
        url: '/pages/noInternet/noInternet',
      });
    }
  })
}

const share = (res, shareConfig = {}, toastText = '') => {
  if (res.from === 'button'){
    wx.showShareMenu({
      success: function () {
        setTimeout(function () {
          quick.showToastNone(toastText)
        }, 3000)
      }
    })
  }
  return shareConfig
}

/**
 * 判断是否有用户信息 [头像，昵称]
 * return Boolean
 */
const isUserShowInfo = (app) => {
  return app.globalData.userShowInfo === null ? false : true;
}

/**
 * 新增用户
 * appId, unionId, openId
 */
const addUserInfo = (obj) => {
  quick.requestPost({ url: 'addUserInfo' }, obj);
}

/**
 * 获取用户地理位置
 */
const getLocation = (app) => {
  wx.getLocation({
    type: 'wgs84',
    success: res => {
      const activitiesAddress = {
        isAllow: false,
        province: '',
        provinceId: null,
        city: '',
        cityId: null,
        district: '',
        districtId: null,
      };
      activitiesAddress.latitude = res.latitude;
      activitiesAddress.longitude = res.longitude;

      // 转换经纬度为省市区
      quick.requestGet({
        url: 'getLocation'
      }, {
        latitude: res.latitude,
        longitude: res.longitude
      }).then(res => {
        const { code, data } = res.data;
        if (code === 0) {

          app.globalData.activitiesAddress = {
            isAllow: false,
            province: data.province,
            provinceId: null,
            city: data.city,
            cityId: null,
            district: data.district,
            districtId: null,
          }
        }
      })
    }
  })
}

//获取小程序分享信息
const getBargainMinaShareInfo = (that) => {
  quick.requestGet({ url: 'getBargainMinaShareInfo' }, {}).then((res) => {
    const { code, data } = res.data;
    if (code === 0) {
      that.globalData.minaShareInfo = data
    }
  })
}

// 收集formId
const saveFormId = (openId, formId) => {
  if (/\s+/g.test(formId) || formId == undefined) {
    return;
  }
  
  quick.requestPost({ url: 'addUserFormId' }, { openId, formId });
}

//分享自砍
const shareBargainByOwn = (formData,that,setDataStr,callback) => {
  quick.requestPost({ url: 'shareBargainByOwn' }, formData).then((res) => {
    let { code, data } = res.data;
    if (code === 0) {
      data = util.handleData(data, { cutAmount: 'price' });
      if (typeof (callback) == 'function'){
        callback(data.cutAmount);
      }
      that.setData({
        [setDataStr]: false,
        shareResult: true,
        'dialogBargainRes.isShow': true,
        'dialogBargainRes.scene': "shareBargainByOwn",
        'dialogBargainRes.price': data.cutAmount
      })
    } else {
      that.setData({
        shareResult: false
      })
      setTimeout(function () {
        quick.showToastNone('抱歉，第二刀竟然没砍中，稍后请重新分享好友，多砍一刀哦')
      }, 1500)
    }
  })
}

//记录分享记录
const addShare = (formData) => {
  quick.requestPost({ url: 'addShare' }, formData).then((res) => {
    const { code, data } = res.data;
    if (code === 0) {
    }     
  })
}

// 校验库存
const checkStock = (app, sn, sku, scene) => {
  return new Promise((resolve, reject) => {
    const formData = {
      openId: app.globalData.openId,
      goodsSn: sn,
      goodsSkuSn: sku
    }
    quick.requestPost({ url: 'checkStock' }, formData).then(res => {
      const { code, data } = res.data;
      if (code === 0) {
        resolve()
      } else if (code === 1) {
        quick.toggleModal('', langs.noStock, () => {
          wx.redirectTo({
            url: '/pages/index/index',
          })
        }, '确定', '取消', false);
      } else if (code === 2) {
        quick.toggleModal('', langs.buyBeyond, () => {
          wx.redirectTo({
            url: '/pages/index/index',
          })
        }, '确定', '取消', false);
        
      } else if (code === 3) {// 添加超过砍价活动时间
        // (title = '', content, confirmCallBack, confirmText = '确定', cancelText = '取消', showCancel = true, cancelCallBack)
        const content = `很抱歉，该规格商品的活动时间仅剩${data}分钟了，您确定发起${data}分钟内的砍价活动吗？`;
        if (scene == 'twoBargainByOwn') {
          quick.toggleModal(
            '', content,
            () => {
              resolve()
            },
            '确定', '返回列表', true,
            () => {
              wx.redirectTo({
                url: '/pages/index/index',
              })
            });
        } else {
          quick.toggleModal(
            '', content,
            () => {
              resolve()
            },
            '确定', '取消', true, () => { });
        }
        
      } else {
        quick.showToastNone(langs.bargainFail);
      }
    })
  })
}

//获取最新的购买金额
const getNewestBuyPrice = (app, brUuid,url) => {
  return new Promise((resolve, reject) => {
    let formData = {
      openId: app.globalData.openId,
      brUuid: brUuid,
    };
    quick.requestGet({ url: 'getNewestBuyPrice' }, formData).then((res) => {
      let { code, data } = res.data;
      if (code !== 0) {
        data = util.formatPrice(data)
        resolve(res)
      } else {
        quick.showToastNone('获取信息失败')
      }
    })
  })
}

// 弹框提示是否购买
const toggleBuyGoods = (buynowprice, callback) => {
  let title = '';
  let content =  buynowprice + '元立即购买？';
  quick.toggleModal(title, content, callback) 
}

// 起砍价或一口价购买
const startOrBuyNowPrice = (app, bruuid) => {
  return new Promise((resolve, reject) => {
    let formData = {
      openId: app.globalData.openId,
      brUuid: bruuid,
    }
    quick.requestPost({ url: 'startOrBuyNowPrice' }, formData).then((res) => {
      const { code, data } = res.data;
      if (code === 0) {
        resolve(res)
      } else {
        quick.showToastNone('购买失败,请重试！')
      }
    })
  })
}
module.exports = {
  getNetwordType: getNetwordType,
  getBargainMinaShareInfo: getBargainMinaShareInfo,
  share: share,
  isUserShowInfo: isUserShowInfo,
  addUserInfo: addUserInfo,
  getLocation: getLocation,
  saveFormId: saveFormId,
  shareBargainByOwn: shareBargainByOwn,
  addShare: addShare,
  checkStock: checkStock,
  getNewestBuyPrice,
  toggleBuyGoods,
  startOrBuyNowPrice
}