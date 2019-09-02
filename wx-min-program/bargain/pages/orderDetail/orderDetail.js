// pages/orderDetail/orderDetail.js
const app = getApp();
const quick = require('../../utils/quick.js');
const util = require('../../utils/util.js');
const business = require('../../utils/business.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    brUuid: '',
    goodsSn: '',
    goodsSkuSn: '',

    addressInfo: null, // 用户收货地址信息
    goodsName: '',
    goodsPicUrl: '',
    goodsSkuName: '',
    goodsSubtitle: '',
    originalPrice: '', // 原价
    buyNowPrice: '', // 一口价
    lowestPrice: '', // 最低价
    orderStepInfo: [], // 订单追踪步骤
    buyType: '',
    payType: '',
    bargainOrderNo: '', // 订单号
    status: '', // 砍价状态（1起砍价代付款，2一口价待付款，3砍价成功待付款、4正在砍价中、5已支付待发货、6已支付已发货、7已完成、8砍价失败、9砍价取消）
    afterSalePhone: '', // 售后电话
    
    // 订单商品价格子项
    orderPriceField: [
      /**
      {
        title: '',
        price: '',
        cls: '',
      }
      */
    ],

    // 订单子项字段
    orderInfoField: [
      {
        cls: '',
        title: '订单编号',
        field: 'bargainOrderNo',
        value: '',
      },
      {
        cls: 'rmb',
        title: '订单总价',
        field: 'payAmount',
        value: '',
      },
      {
        cls: 'rmb',
        title: '运费',
        field: 'freight',
        value: ''
      },
      {
        cls: 'rmb',
        title: '订单已付',
        field: 'payAmount',
        value: ''
      },
      {
        cls: '',
        title: '支付方式',
        field: 'payType',
        value: ''
      },
    ],

    buttonText: '',
    buttonTextByStatus: {
      0: '马上完善收货信息',
      1: '提醒发货',
      2: '确认收货',
    },
    // 购买类型
    buyTypeText: {
      buyStartPrice: '起砍价',
      buyNowPrice: '一口价',
      buyLowestPrice: '最低价',
    },

    // 支付类型
    payTypeText: {
      wxpay: '微信支付'
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (!options.brUuid) {
      quick.showToastNone('页面错误');
      return;
    }
    quick.showLoading();
    this.data.brUuid = options.brUuid;
    // this.data.goodsSn = options.goodsSn;
    // this.data.goodsSkuSn = options.goodsSkuSn;
    
  },
  
  onShow() {
      this.getOrderInfo();
  },

  getOrderInfo() {
    if (!app.globalData.openId) {
      setTimeout(() => {
        this.getOrderInfo()
      }, 100)
      return;
    }

    quick.requestGet({ url: 'getOrderInfo' }, {
      openId: app.globalData.openId,
      brUuid: this.data.brUuid
      // goodsSn: this.data.goodsSn,
      // goodsSkuSn: this.data.goodsSkuSn,
    }).then( res => {
      let { code, data } = res.data;
      if (code === 0) {
        // 如果没有选择地址则跳转到地址页面
        if (data.addressInfo == null) {
          wx.redirectTo({
            url: `/pages/consigneeAddress/consigneeAddress?goodsSn=${data.goodsSn}&goodsSkuSn=${data.goodsSkuSn}&brUuid=${this.data.brUuid}`,
          })
          return;
        }
        data = util.handleData(data, {
          payAmount: 'price',
          freight: 'price',
          originalPrice: 'price',
          buyNowPrice: 'price',
          lowestPrice: 'price',
          startBargainPrice: 'price',
          goodsPicUrl: 'mllImg',
        });
        
        this.setData({
          goodsSn: data.goodsSn,
          goodsSkuSn: data.goodsSkuSn,
          addressInfo: data.addressInfo,
          goodsName: data.goodsName,
          goodsPicUrl: data.goodsPicUrl,
          goodsSkuName: data.goodsSkuName,
          goodsSubtitle: data.goodsSubtitle,
          orderStepInfo: data.orderStepInfo,
          originalPrice: data.originalPrice,
          buyNowPrice: data.buyNowPrice,
          lowestPrice: data.lowestPrice,
          buyType: data.buyType,
          bargainOrderNo: data.bargainOrderNo,
          status: data.status,
          afterSalePhone: data.afterSalePhone || '',
        })
        this.setButtonText(data);
        this.setOrderInfoField(data);
        this.setOrderPriceField(data);

        wx.hideLoading();
      }
    })
  },

  // 设置订单子项字段值
  setOrderInfoField(data) {
    Array.prototype.forEach.call(this.data.orderInfoField, (val, key) => {
      switch (val.field) {
        case 'payType':
          this.data.orderInfoField[key].value = this.data.payTypeText[data[val.field]];
          break;
        default:
          this.data.orderInfoField[key].value = data[val.field];
          break;
      }
    })

    this.setData({
      orderInfoField: this.data.orderInfoField
    })
  },

  // 设置订单价格字段
  setOrderPriceField(data) {
    let arr = [];
    // if (data.buyType === 'buyLowestPrice') {
    //   arr.push({
    //     price: data.lowestPrice,
    //     title: '',
    //     cls: ''
    //   });
    //   arr.push({
    //     title: "起砍价：",
    //     price: data.originalPrice,
    //     cls: 'original-price'
    //   })
    // } else {
    //   const priceField = {
    //     buyStartPrice: 'startBargainPrice',
    //     // buyNowPrice: 'buyNowPrice'
    //     buyNowPrice: 'payAmount'
    //   }
      arr.push({
        // title: `${this.data.buyTypeText[data.buyType]}：`,
        title: '',
        price: data['payAmount'],
        cls: ''
      });
    //   arr.push({
    //     title: "最低价：",
    //     price: data.lowestPrice,
    //     cls: 'min-price'
    //   });
      arr.push({
        title: "起砍价：",
        price: data.originalPrice,
        cls: 'original-price'
      });
    // }

    this.setData({
      orderPriceField: arr
    })
  },

  // 设置按钮文本
  setButtonText(data) {
    // if (data.addressInfo == null) {
    //   this.setData({
    //     buttonText: this.data.buttonTextByStatus[0]
    //   })
    // } else
    if(parseInt(data.status) === 5) {
      this.setData({
        buttonText: this.data.buttonTextByStatus[1]
      })
    } else if (parseInt(data.status) === 6) {
      this.setData({
        buttonText: this.data.buttonTextByStatus[2]
      })
    }
  },

  // 跳转物流信息页面
  goLogisticsLog() {
    wx.navigateTo({
      url: `/pages/logisticsLog/logisticsLog?orderNo=${this.data.bargainOrderNo}`,
    })
  },

  goConsigneeAddress() {
    if (this.data.buttonText === this.data.buttonTextByStatus[0]) {
      wx.navigateTo({
        url: `/pages/consigneeAddress/consigneeAddress?goodsSkuSn=${this.data.goodsSkuSn}&orderNo=${this.data.bargainOrderNo}`,
      })
    }
  },

  btnEvent(e) {
    business.saveFormId(app.globalData.openId, e.detail.formId);
    // const { sn, skusn } = e.detail.target.dataset;
    // if (this.data.addressInfo === null) {
    //   this.goConsigneeAddress();
    //   return;
    // }
    
    switch (this.data.buttonText) {
      case this.data.buttonTextByStatus[1]: // 提醒发货
        quick.requestPost({ url: 'remindSend' }, {
          openId: app.globalData.openId,
          unionId: app.globalData.unionId,
          orderNo: this.data.bargainOrderNo
        }).then(res => {
          const { code, data } = res.data;
          const msg = {
            0: '已提醒卖家尽快发货！',
            1000: '24小时内您已提醒过卖家了'
          }
          quick.showToastNone(msg[code] || msg[0]);
        })
        break;
      case this.data.buttonTextByStatus[2]: // 确认收货
        quick.requestPost({ url: 'confirm' }, {
          openId: app.globalData.openId,
          unionId: app.globalData.unionId,
          orderNo: this.data.bargainOrderNo
        }).then(res => {
          const { code, data } = res.data;
          if(code === 0) {
            quick.showToastNone('您已确认收货');
            this.getOrderInfo();
          } else {
            quick.showToastNone('确认收货失败');
          }
        })
        break;
    }
    
  },

  // 拨打电话
  callPhone(e) {
    if (!this.data.afterSalePhone) {
      console.log('售后电话为空');
      return;
    }
    wx.makePhoneCall({
      phoneNumber: this.data.afterSalePhone
    })
  },

  showQuestion() {
    quick.showToastNone('您可以先确认收货，然后申请售后')
  }
})