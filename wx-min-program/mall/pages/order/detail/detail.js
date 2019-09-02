/*==================================================
 * project: meilele mall min-program 
 * author: leihao
 * createTime: 2018/10/31
 * file: detail.js
 * description: 订单详情页
 * 
 * 
 * 
 * 页脚本文件
 ==================================================*/
const $ = global;
const app = getApp();
const requestPrefix = app.globalData.domain;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 订单号
    orderSn: '2018222222212555',

    // 订单数据
    data_order: [],

    // 商品数据
    data_goods: [],

    // 付款项数据
    data_payment: [],

    // 是否隐藏取消订单按钮
    flag_isHiddenCancelBtn: false,
    imagesUrl: app.globalData.imagesUrl
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (params) {
    /*if (!params.orderSn) {
      return;
    }*/
    this.data.orderSn = params.orderSn || '2018103146569';
    this.setData({
      orderSn: this.data.orderSn
    });

    this._getDataByOrderSn();
  },

  /**
   * 根据订单号获取页面数据
  */
  _getDataByOrderSn: function() {
    let orderSn = this.data.orderSn;
    this.setData({
      data_goods:[]
    })
    $.ajax({
      url: requestPrefix + '/user/XcxUser/order_detail/?order_sn=' + orderSn,
      method: 'GET',
      dataType: 'json',
      success: (res)=>{
        if (res.data) {
          let json = res.data.data;
          this.data.data_order = json.order;
          this.data.data_payment = json.order_number_detail;

          // 循环商品列表
          for (let key in json.goods_list) {
            this.data.data_goods.push(...json.goods_list[key]);
          }
          
          this.setData({
            data_order: this.data.data_order,
            data_goods: this.data.data_goods,
            data_payment: this.data.data_payment
          });
        }
      }
    });
  },

  /**
   * 取消订单
  */
  cancelOrderEvent: function() {
    this.cancelOrderComponent.toggleDisplayStatus();
  },

  /**
   * 支付
  */
  payEvent: function() {
    let orderSn = this.data.orderSn; // 订单号
    let userId = wx.getStorageSync('user_id'); // 用户id
    let openId = wx.getStorageSync('openid'); // openid
    let totalFee = this.data.data_payment.should_pay_format; // 需要支付的费用
    let isPart = 0; // 是否部分支付 1-是，0-否

    let postData = {
      orderSn: orderSn,
      userId: userId,
      openid: openId,
      totalFee: totalFee,
      isPart: isPart
    };

    $.ajax({
      url: $.config.REQUEST_URL + 'dubbo_api/paymentService/paymentRestService/miniAppPrePay',
      method: 'POST',
      header: { "content-Type": "application/x-www-form-urlencoded" },
      data: postData,
      dataType: 'json',
      success: (res)=>{
        if (res.data) {
          if (res.data.error == 0) {
            this._wxPaymentEvent(res.data.data);
          } else {
            failFn(res.data.msg);
          }
        } else {
          failFn();
        }
      },
      fail: function() {
        failFn();
      }
    });

    // 错误提示
    function failFn(msg) {
      if (msg) {
        msg = msg;
      } else {
        msg = '有一点小小的意外，请稍后重试，谢谢'
      }
      wx.showToast({
        title: msg,
        icon: 'none',
        duration: 2000
      });
    }
  },

  /**
   * 调用微信支付
  */
  _wxPaymentEvent: function(json) {
    let that = this
    wx.requestPayment({
      timeStamp: json.timeStamp,
      nonceStr: json.nonceStr,
      package: json.package,
      signType: json.signType,
      paySign: json.paySign,
      success: function(res) {
        that._getDataByOrderSn()
      },
      fail: function() {

      }
    })
  },

  /**
   * 取消订单后的回调函数
  */
  cancelOrderCallback: function() {
    this._getDataByOrderSn()
    this.data.flag_isHiddenCancelBtn = true;
    this.setData({
      flag_isHiddenCancelBtn: this.data.flag_isHiddenCancelBtn
    });
  },

  /**
   * 确认收货
  */
  confirmReceiptEvent: function(e) {
    let orderId = e.currentTarget.dataset.orderid;
    let that = this
    wx.showModal({
      title: '',
      content: '你确认已经收到货物了吗？',
      cancelColor: '#999',
      confirmColor: '#da0000',
      success: (res) => {
        if (res.confirm) {
          $.ajax({
            url: `${app.globalData.Login_url}user/?act=affirm_received`,
            data: {
              order_id: orderId
            },
            success: (result) => {
              if (result.statusCode == 200) {
                if (result.data.error == 0) {
                  that._getDataByOrderSn()
                  wx.showToast({
                    mask: true,
                    duration: 1000,
                    title: '确认收货成功！'
                  });
                } else {
                  wx.showToast({
                    mask: true,
                    duration: 1000,
                    title: result.data.msg
                  });
                }
              }
            }
          });
        } else if (res.cancel) { }
      }
    });
  },
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 取消订单
    this.cancelOrderComponent = this.selectComponent('#cancelOrderContainer');
  },

  onShow: function() {
    // 调用跟踪代码
    $.track.push(['trackView']);
  }
})