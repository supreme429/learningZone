// pages/location/location.js
const app = getApp();
const quick = require('../../utils/quick.js');
const { langs } = require('../../utils/langs.js');
const util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsSn: '',
    goodsSkuSn: '',
    isAllow: false,

    bargainUrl: "startBargain", // 发起砍价的场景，默认为startBargain，当scene = twoBargainByOwn 则 bargainUrl = twoBargainByOwn

    scopeUserLocation: false, // 是否允许地理位置授权
    outServiceArea: true, // 是否在服务区
    showActivitiesAddress: false, // 是否展示地区选择模块
    textSelectAddress: '请选择活动地区',
    activitiesAddress: {
      isAllow: false,
      province: '',
      provinceId: null,
      city: '',
      cityId: null,
      district: '',
      districtId: null,
    }
  },

  onLoad(options) {
    if (!options.goodsSn && !options.goodsSkuSn) {
      quick.showToastNone('页面错误!');
      return;
    }

    // 判断是发起砍价还是自砍两刀
    // this.data.bargainUrl = options.scene == 'twoBargainByOwn' ? 'twoBargainByOwn' : 'startBargain';
    
    this.setData({
      goodsSkuSn: options.goodsSkuSn,
      goodsSn: options.goodsSn
    })
    if (app.globalData.activitiesAddress != null) {
      this.setData({
        activitiesAddress: app.globalData.activitiesAddress
      })
    }
    
    wx.getSetting({
      success: res => {
        this.setData({
          scopeUserLocation: res.authSetting['scope.userLocation']
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function() {
    this.getAddress();
    if (app.globalData.activitiesAddress === null) {
      this.getAddress();
    } else {
      this.setData({
        activitiesAddress: app.globalData.activitiesAddress
      });
    }
  },

  // 获取地理位址
  getAddress() {
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        const activitiesAddress = this.data.activitiesAddress;
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
            activitiesAddress.province = data.province;
            activitiesAddress.district = data.district;
            activitiesAddress.city = data.city;

            this.setData({
              activitiesAddress: activitiesAddress,
              textSelectAddress: `${data.province} ${data.city} ${data.district}`,
            })

            // 验证该经纬下是否在活动范围内
            quick.requestGet({
              url: 'checkRegion'
            }, {
                province: data.province,
                city: data.city,
                district: data.district,
                goodsSkuSn: this.data.goodsSkuSn,
            }).then(res => {
              const { code } = res.data;
              if (code === 0) {
                this.setStroageAddress(activitiesAddress);
                this.setData({
                  isAllow: true,
                  activitiesAddress: activitiesAddress
                })
              } else {
                app.globalData.activitiesAddress = null;
                this.setData({
                  outServiceArea: false
                })
              }
            }).catch(err => {
              this.setData({
                outServiceArea: false
              })
            })
          }
        })
        
      }
    })
  },

  // 设定全局地区信息
  setStroageAddress(obj) {
    app.getActivitiesAddress(obj);
  },

  // 保存手动选择的活动地区
  saveActivitiesAddress(obj) {
    Object.assign(this.data.activitiesAddress, obj.detail);
    const { province, city, district } = this.data.activitiesAddress;

    this.setData({
      isAllow: true,
      activitiesAddress: this.data.activitiesAddress,
      textSelectAddress: province && city && district ? `${province} ${city} ${district}` : '请选择活动地区',
    });

    this.setStroageAddress(this.data.activitiesAddress);
  },

  toggleActivitiesAddress() {
    this.setData({
      showActivitiesAddress: !this.data.showActivitiesAddress
    })
  },

  // 确认砍价地区
  confirmAddress() {
    if (app.globalData.activitiesAddress != null && this.data.isAllow) {
      app.globalData.activitiesAddress.isAllow = this.data.isAllow;
      this.checkStock(this.data.goodsSn, this.data.goodsSkuSn).then(res => {
        this.goBargain();
      });
      
    }
  },


  // 发起砍价
  goBargain() {
    const sn = this.data.goodsSn;
    const skusn = this.data.goodsSkuSn;

    // 跳转到砍价详情页面
    quick.requestPost({ url: this.data.bargainUrl }, {
      openId: app.globalData.openId,
      goodsSn: sn,
      goodsSkuSn: skusn,
    }).then(res => {
      let { code, data } = res.data;
      if (code === 0 || code === 2) {
        const showModalBargainMoreOne = code == 0 && this.data.bargainUrl == 'startBargain' ? 1 : 0;
        // 添加缓存地址
        if(code === 0) {
          this.cacheAddressInfo(data.brUuid);
          data = util.handleData(data, { cutAmount: "price" });
        }
        // 增加砍两刀逻辑
        wx.redirectTo({
          url: `/pages/bargainDetail/bargainDetail?brUuid=${data.brUuid}&goodsSn=${sn}&goodsSkuSn=${skusn}&showModalBargainMoreOne=${showModalBargainMoreOne}&bargainScene=${this.data.bargainUrl}&bargainPrice=${data && data.cutAmount}`,
        })
      } else {
        quick.showToastNone(langs.bargainFail);
      }
    })
  },

  // 校验库存
  checkStock(sn, sku) {
    return new Promise((resolve, reject) => {
      const formData = {
        openId: app.globalData.openId,
        goodsSn: sn,
        goodsSkuSn: sku
      }
      quick.requestPost({ url: 'checkStock' }, formData).then((res) => {
        const { code, data } = res.data;
        if (code === 0 || code == 3) {
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
        } else {
          quick.showToastNone(langs.bargainFail);
        }
      })
    })
  },

  // 缓存用户省市区到后台
  cacheAddressInfo(brUuid) {
    let formData = {
      openId: app.globalData.openId,
      brUuid
    }
    Object.assign(formData, this.data.activitiesAddress);
    return new Promise((resolve, reject) => {
      quick.requestPost({ url: 'cacheAddressInfo' }, formData).then(res => {
        if(res.code === 0) {
          resolve()
        } else {
          console.log('cacheAddressInfo,缓存地址失败');
        }
      })
    })
  },
})