// pages/consigneeAddress/consigneeAddress.js
const app = getApp();
const quick = require('../../utils/quick.js');
const util = require('../../utils/util.js');
const business = require('../../utils/business.js');
const { langs } = require('../../utils/langs.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bargainUrl: "startBargain", // 发起砍价的场景，默认为startBargain，当scene = twoBargainByOwn 则 bargainUrl = twoBargainByOwn
    consigneeList: [],
    goodsSn: '',
    goodsSkuSn: "",
    brUuid: "",

    dialogConsigneeShow: false,
    activitiesAddressShow: false,
    isAllowSelectAddress: false, // 若缓存中没有省市区数据则可以自己选择
    scrollTop: 0,
    scrollY: true,

    isDbSave: false, // 是否二次提交
    bargainInfo: {}, 
    consigneeInfo: {
      userName: '',
      userPhone: '',
      address: '',
      province: "",
      provinceId: "",
      city: "",
      cityId: "",
      district: "",
      districtId: "",
      // address: '交子大道177号中海国际中心B座5楼',
      // province: "四川省",
      // provinceId: "24",
      // city: "成都市",
      // cityId: "272",
      // district: "高新区",
      // districtId: "15400",
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (!options.goodsSkuSn || !options.goodsSn || !options.brUuid) {
      quick.showToastNone('页面错误');
      return;
    }

    // 判断是发起砍价还是自砍两刀
    // this.data.bargainUrl = options.scene == 'twoBargainByOwn' ? 'twoBargainByOwn' : 'startBargain';
    wx.showLoading();
    this.setData({
      goodsSkuSn: options.goodsSkuSn,
      goodsSn: options.goodsSn,
      brUuid: options.brUuid,
    })
  },

  onShow() {
    this.getUserAddressList();
    this.getBargainInfo();
    this.getAddressInfoByBrUuid();
  },

  getUserAddressList() {
    quick.requestGet({ url: 'getUserAddressList' }, {
      openId: app.globalData.openId,
      goodsSkuSn: this.data.goodsSkuSn
    }).then(res => {
      const { code, data } = res.data;
      if(code === 0 && data != null) {
        this.setData({
          consigneeList: data
        })
      }
      wx.hideLoading();
    })
  },

  getBargainInfo() {
    let formData = {
      openId: app.globalData.openId,
      brUuid: this.data.brUuid,
      goodsSn: this.data.goodsSn,
      goodsSkuSn: this.data.goodsSkuSn
    };

    quick.requestGet({ url: 'getBargainInfo' }, formData).then((res) => {
      const { code, data } = res.data;
      if (code === 0) {
        this.setData({
          bargainInfo: data
        })
      } 
      // else {
      //   this.setData({
      //     isAllowSelectAddress: true
      //   })
      // }
    })
  },

  // todo 根据brUuid获取该单号预存的省市区
  getAddressInfoByBrUuid() {
    quick.requestGet({ url: 'getAddressInfo' }, {
      openId: app.globalData.openId,
      brUuid: this.data.brUuid
    }).then(res => {
      const { code, data } = res.data;
      if (code === 0) {
        // todo 待内测完后返回正则数据
        this.setData({
          consigneeInfo: data
        })
      }
    })
  },

  // 输入值
  inputValue(e) {
    const { field } = e.currentTarget.dataset;

    this.setData({
      [`consigneeInfo.${field}`]: e.detail.value
    })
  },

  // 切换新增收货地址弹窗
  toggleDialogConsignee() {
    this.setData({
      scrollTop: 0,
      dialogConsigneeShow: !this.data.dialogConsigneeShow
    })
  },

  // 切换省市区弹窗
  toggleActivitiesAddressShow() {
    // if (!this.data.isAllowSelectAddress) return;
    this.setData({
      activitiesAddressShow: !this.data.activitiesAddressShow
    })
  },

  // 新增收货地址
  saveConsignee(obj) {
    if (this.data.isDbSave) return;
    const data = {
      openId: app.globalData.openId,
      userName: "",
      userPhone: "",
      province: "",
      provinceId: "",
      city: "",
      cityId: "",
      district: "",
      districtId: "",
      address: "",
    }

    Object.assign(data, this.data.consigneeInfo);

    // 检验用户名
    if (!data.userName) {
      quick.showToastNone(langs.consigneeUserNameNone);
      return;
    } else if (data.userName.length > 8) {
      quick.showToastNone(langs.consigneeUserNameBeyond);
      return;
    }

    // 检验手机号
    if (!/^1[\d]{10}$/.test(data.userPhone)) {
      quick.showToastNone(langs.phoneError);
      return;
    }

    // 检验省市区
    if (!(data.province && data.city && data.district)) {
      quick.showToastNone(langs.threeAreatNone);
      return;
    }

    // 检验详细地址
    if (!data.address) {
      quick.showToastNone(langs.consigneeAddressNone);
      return;
    } else if (data.address.length > 50) {
      quick.showToastNone(langs.consigneeAddressBeyond);
      return;
    }

    this.data.isDbSave = true;
    quick.requestPost({ url: 'addUserAddress' }, data)
      .then(res => {
        const { code, data } = res.data;
        if(code === 0) {
          this.toggleDialogConsignee();
          wx.showToast({
            icon: 'success',
            title: '新增地址成功！',
          })
          this.getUserAddressList();
          this.resetConsigneeInfo();
        } else {
          quick.showToastNone('新增地址失败，请重试！');
        }
        this.data.isDbSave = false;
      }).catch(err => {
        this.data.isDbSave = false;
      })
    
  },

  // 保存省市区数据
  saveThreeId(obj) {
    Object.assign(this.data.consigneeInfo, obj.detail);
    this.setData({
      consigneeInfo: this.data.consigneeInfo
    })
  },

  // 重置地址数据
  resetConsigneeInfo() {
    Array.prototype.forEach.call(this.data.consigneeInfo, (val, key) => {
      this.data.consigneeInfo[key] = ""
    });
    this.setData({
      consigneeInfo: this.data.consigneeInfo
    })
  },

  /**
   * 选择收货地址
   */
  selectConsigneeAddress(e) {
    const { index } = e.currentTarget.dataset;
    const item = this.data.consigneeList[index];
    const sn = this.data.goodsSn;
    const skuSn = this.data.goodsSkuSn;

    if (item.status != 1) return;

    const title = '请确认您的收货地址';
    const content = `${item.userName},${item.userPhone},${item.province}${item.city}${item.district}${item.address}`;
    const confirmCallBack = () => {
      // 支付下单
      this.confirmAddress(item).then(res => {
        this.payNow();
      })
    };
    quick.toggleModal(title, content, confirmCallBack);
  },

  // 发起砍价
  /**
  goBargain(arUuid) {
    const sn = this.data.goodsSn;
    const skusn = this.data.goodsSkuSn;

    // 跳转到砍价详情页面
    quick.requestPost({ url: this.data.bargainUrl }, {
      openId: app.globalData.openId,
      goodsSn: sn,
      goodsSkuSn: skusn,
      arUuid,
    }).then(res => {
      let { code, data } = res.data;
      if (code === 0 || code === 2) {
        const showModalBargainMoreOne = code == 0 && this.data.bargainUrl == 'startBargain' ? 1 : 0;
        wx.redirectTo({
          url: `/pages/bargainDetail/bargainDetail?brUuid=${data.brUuid}&goodsSn=${sn}&goodsSkuSn=${skusn}&showModalBargainMoreOne=${showModalBargainMoreOne}`,
          success: () => {
            if (this.data.bargainUrl == 'twoBargainByOwn') {
              data = util.handleData(data, { cutAmount: "price" });
              let toastStr = `已发起砍价，成功砍了2刀，共砍掉${data.cutAmount}元`;
              quick.showToastNone(toastStr);
            }
          }
        })
      } else {
        quick.showToastNone(langs.bargainFail);
      }
    })
  },
  */

  /** 起砍价或一口价购买流程 start */
  // 马上支付 【零元支付 | 一口价 | 起砍价 | 最低价】
  payNow() {
    let { brUuid, goodsSn, goodsSkuSn } = this.data
    let formData = {
      openId: app.globalData.openId,
      brUuid: brUuid,
      goodsSn: goodsSn,
      goodsSkuSn: goodsSkuSn,
    }
    business.checkStock(app, goodsSn, goodsSkuSn).then(() => {
      // 零元支付
      if (this.data.bargainInfo.isZero) {
        this.payZero(formData);
      } else {
        this.paySubmit(formData);
      }
    })
  },

  // 支付【调用支付接口获取支付参数，成功则调起支付弹窗】
  paySubmit(formData) {
    quick.requestGet({ url: 'getPayJsApi' }, formData).then((res) => {
      const { code, data } = res.data;
      if (code === 0) {
        const { appId, nonceStr, packageStr, paySign, signType, timeStamp } = data
        // 小程序支付api
        wx.requestPayment({
          timeStamp: timeStamp,
          nonceStr: nonceStr,
          package: packageStr,
          signType: signType,
          paySign: paySign,
          success: () => {
            this.checkPayRecordStatus()
          },
          fail: () => {
            quick.showToastNone('支付失败')
          }
        })
      } else if (code === 1) {
        quick.toggleModal('', langs.noStock, this.cancelOrederAndGoIndex, '确定', '取消', false)
      } else if (code === 2) {
        quick.toggleModal('', langs.buyBeyond, this.cancelOrederAndGoIndex, '确定', '取消', false)
      } else {
        quick.showToastNone('支付失败')
      }
    })
  },

  // 零元支付
  payZero(formData) {
    quick.requestPost({ url: 'payZero' }, formData).then(res => {
      const { code } = res.data;
      if (code === 0) {
        this.goToOrderDetail();
      } else if (code === 1) {
        quick.toggleModal('', langs.noStock, this.cancelOrederAndGoIndex, '确定', '取消', false)
      } else if (code === 2) {
        quick.toggleModal('', langs.buyBeyond, this.cancelOrederAndGoIndex, '确定', '取消', false)
      } else {
        quick.showToastNone('支付失败');
      }
    })
  },

  // 取消订单
  cancelOrederAndGoIndex() {
    quick.requestPost({ url: 'cancelOrder' }, { openId: app.globalData.openId, brUuid: this.data.brUuid });
    this.goToIndex();
  },

  // 校验支付成功的订单状态
  checkPayRecordStatus() {
    if (!this.data.bargainInfo.bargainOrderNo) {
      setTimeout(() => {
        this.checkPayRecordStatus();
      }, 50)
    }

    const formData = {
      openId: app.globalData.openId,
      orderNo: this.data.bargainInfo.bargainOrderNo
    }

    quick.requestGet({ url: 'checkPayRecordStatus' }, formData).then((res) => {
      const { code, data } = res.data;
      if (code === 0) {
        this.goToOrderDetail()  // 二次确认生成订单成功跳转到订单详情
      }
    })
  },

  //跳转到订单详情
  goToOrderDetail() {
    wx.redirectTo({
      url: '/pages/orderDetail/orderDetail?brUuid=' + this.data.brUuid
    })
  },

  /** 起砍价或一口价购买流程 end */
  confirmAddress(consigneeInfo) {
    return new Promise((resolve, reject) => {
      quick.requestPost({ url: 'confirmAddress' }, {
        arUuid: consigneeInfo.arUuid,
        orderNo: this.data.bargainInfo.bargainOrderNo,
        openId: app.globalData.openId,
        unionId: app.globalData.unionId
      })
        .then(res => {
          const { code, data } = res.data;
          if (code === 0) {
            resolve()
          } else {
            quick.showToastNone('选择地址失败！')
          }
        })
    })
  },

  dialogConsigneeScroll() {
    return false;
  }
})