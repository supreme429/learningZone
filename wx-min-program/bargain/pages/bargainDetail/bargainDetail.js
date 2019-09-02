// pages/bargainDetail2/bargainDetail2.js
const quick = require('../../utils/quick.js');
const util = require('../../utils/util.js');
const { langs } = require('../../utils/langs.js');
const business = require('../../utils/business.js');
const { appName } = require('../../config/config.js');
const app = getApp()
/**
 * 我的砍件详情页面
 * 显示我的砍件详情及支付
 */
Page({
  /**
   * 页面的初始数据
   */
  data: {
    brUuid: '',
    goodsSn: '',
    goodsSkuSn: '',

    sHeight: 0,
    scene: 1, // 页面场景  1：我的砍价;2: 支付
    //处理价格的字段配置
    handlePriceField: {
      originalPrice: 'price', 
      lowestPrice: 'price',  
      cutAmount: 'price',
      bargainAmount: 'price',
      buyNowPrice: 'price',
      startBargainPrice: 'price',
      helpBargainAmount: 'price',
      currentPrice: 'price',
      specification: 'json',
      goodsDetails: 'json',
      pictureList: 'mllImg',
    },

    progressData: { // 进度条参数
      staticProgressWidth: 0,
      bargainProgressWidth: 0,
      markerProgressWidth: 0, //里程碑价
    },
    toggle: {
      isShowModalBargainMoreOne: false, // 首次进入砍价金额弹窗
    },
    bargainInfo: {},  // 砍价详情
    goodsInfo: {},  //商品信息
    friendsBargainList: [], // 好友帮砍记录列表
    // 更多砍价商品
    recommendGoods: [],
    friendHelpBargainPage: 0,
    totalPages: 1,
    scrollTop: 0,
    tabActive: 1, //1:好友砍价，2:商品详情
    modalLoginShow: false, // 是否展示登录模块
    isShowBargainProgressWidth: false,  //显示进度条开关
    shareResult: true, // 分享自砍结果
    showModalBargainMoreOne: '',
    dialogBargainRes: { // 分享自砍或自砍两刀显示
      isShow: false,
      price: 0,
      scene: 'shareBargainByOwn'
    },
    stopCountTime: false,   //是否执行倒计时，false：执行，ftrue不执行
    buyNowConfig: {
      buyNowPrice: '',  //起砍价或一口价购买价格
      bargainAmount: '',
      buyNowType: '', //购买类型 一口价购买:1  里程碑价购买：2 最低价购买：3
      buyNowText: {
        1: '',
        2: '一口价',
        3: '',
      }
    },

    drawTimer: null, // 计时器定时器事件
    isSetData: true,
    alignLeft: {
      markerAlignLeft: false,
      dealAlignLeft: false,
      dealAlignRight: '', //解决起砍价提示跑出左边
      hasBargainNum: false
    }, //里程碑价提示是否居左

    dialogBuyNow: false, // 立即购买弹窗
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (!options.brUuid && !options.goodsSn && !options.goodsSkuSn) {
      quick.showToastNone('页面错误！');
      return;
    }

    this.setData({
      brUuid: options.brUuid,
      goodsSn: options.goodsSn,
      goodsSkuSn: options.goodsSkuSn,
      showModalBargainMoreOne: options.showModalBargainMoreOne || 0,
      fromShare: options.fromShare || 0
    })

    this.handleDialogBargainRes(options.bargainScene, options.bargainPrice)
  },

  onReady() {
    // 设置滚动条高度
    util.getSystemInfoAsync().then(res => {
      console.log(res)
      util.getDomInfoById('#foot').then(rect => {
        this.setData({
          sHeight: res.windowHeight - (this.data.scene == 1 ? rect.height : 0) + 'px'
        })
      })
    })
  },

  onShow() {
    this.setData({
      stopCountTime: false
    })
    this.init();
  },

  onHide(){
    this.setData({
      friendHelpBargainPage: 0,
      friendsBargainList: [],
      stopCountTime: true,
      // isShowBargainProgressWidth: false,  //关闭进度条
      //isShowHelpBargainFriends: false,  //关闭显示好友帮砍列表
    })
  },

  onUnload() {
    //3.0版本去掉返回到其他页面刺激首次分享弹框
    // if(this.data.bargainInfo.status ==4){
    //   this.setShowModalShareMoreOne()
    // }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) { 
    if (res.from === 'button') {
      wx.showShareMenu({
        success: () => { 
          // if (this.data.bargainInfo.bargainNum < 2) {    //3.0版本去掉分享自砍
          //   let formData = {
          //     openId: app.globalData.openId,
          //     brUuid: this.data.brUuid
          //   }
          //   business.shareBargainByOwn(formData, this, 'toggle.isShowModalBargainMoreOne', this.shareBargainByOwnCallBack)
          // }
          // 如果是立即购买弹窗发起的分享，则关闭弹窗
          (res.target.dataset.name === 'dialogBuyNow') && this.toggleDialogBuyNow();
        }
      })
      //关闭首次分享弹框
      this.setData({
        'toggle.isShowModalBargainMoreOne': false
      })
      this.addShare() //记录分享记录
      return this.setHelpShareConfig();
    } else {
      debugger
      return {
        title: app.globalData.minaShareInfo.shareDesc ? app.globalData.minaShareInfo.shareDesc : appName,
        path: '/pages/index/index',
        imageUrl: app.globalData.minaShareInfo.sharePic || this.data.goodsInfo.goodsPicUrls[0],
      }
    }
  },

  /**
   * 页面初始化
   * 获取商品详情 | 砍价详情 | 帮砍记录
   */
  init() {
    if (!app.globalData.openId) {
      setTimeout(() => {
        this.init();
      }, 100)
      return;
    };

    this.getGoodsInfo();
    this.getBargainInfo();//获取砍价详情
    this.getNewestBuyPrice();
    this.getHelpBargainRecord();
  },

  //获取商品详情
  getGoodsInfo() {
    const formData = {
      openId: app.globalData.openId,
      goodsSn: this.data.goodsSn,
    }
    quick.requestGet({ url: 'getGoodsInfo' }, formData).then((res) => {
      const { code, data } = res.data;
      if (code === 0) {
        let content = util.handleData(data, this.data.handlePriceField);
        content.goodsPicUrls = util.formatMllImg(content.goodsPicUrls);

        this.setData({
          goodsInfo: content,
        })
      }
    })
  },

  //获取砍价详情
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
        var content = util.handleData(data, this.data.handlePriceField);
        let { bargainEndTime, nowTime, payEndTime, endTime, originalPrice, bargainAmount, lowestPrice} = content;
        content['countTimeNum'] = bargainEndTime > endTime ? endTime - nowTime : bargainEndTime - nowTime
        content['payCountTime'] = payEndTime > endTime ? endTime - nowTime : payEndTime - nowTime
        content['bargainToPrice'] = (originalPrice - bargainAmount).toFixed(2)  //已砍至金额
        content['distanceLowestPrice'] = (originalPrice - bargainAmount - lowestPrice).toFixed(2) // 还差多少钱
        this.setData({
          bargainInfo: content,
        })
        this.setBargainProgress(content);  //设置进度条
        this.checkIsSuccess();  //检验是否砍价成功
        const { bargainNum, status } = this.data.bargainInfo
        // 首次进入页面，未分享，弹窗显示首次砍价金额【showModal】
        if (bargainNum < 2 && this.data.showModalBargainMoreOne==1) {
          this.toggleModalBargainMoreOne()
        }
      }
    })
  },

  //获取帮砍记录
  getHelpBargainRecord() {
    //判断总页数
    if (this.data.totalPages < this.data.friendHelpBargainPage + 1) return;

    let formData = {
      openId: app.globalData.openId,
      brUuid: this.data.brUuid,
      goodsSn: this.data.goodsSn,
      goodsSkuSn: this.data.goodsSkuSn,
      page: this.data.friendHelpBargainPage++
    };

    quick.requestGet({ url: 'getHelpBargainRecord' }, formData).then((res) => {
      let { code, data } = res.data;
      if (code === 0) {
        data.content = util.handleDataByArray(data.content, this.data.handlePriceField)
        this.setData({
          friendsBargainList: this.data.friendsBargainList.concat(data.content),
          totalPages: data.totalPages,
          isShowHelpBargainFriends: true,
        })
      }
    })
  },

  // 设置分享配置
  setHelpShareConfig() {
    
    return {
      title: this.data.goodsInfo.helpShareDesc ? this.data.goodsInfo.helpShareDesc : '万水千山总是情，帮砍一刀肯定行！',
      path: '/pages/helpBargainDetail/helpBargainDetail?goodsSn=' + this.data.goodsSn + '&goodsSkuSn=' + this.data.goodsSkuSn + '&initiatorOpenId=' + app.globalData.openId + '&brUuid=' + this.data.brUuid,
      imageUrl: this.data.goodsInfo.helpSharePicUrl || this.data.goodsInfo.goodsPicUrls[0]
    }
  },

  // 首次进入调用砍价金额显示弹窗
  toggleModalBargainMoreOne() {
    this.setData({
      'toggle.isShowModalBargainMoreOne': !this.data.toggle.isShowModalBargainMoreOne,
      showModalBargainMoreOne: 0
    })
  },

  // 设置砍价进度条
  setBargainProgress(bargainInfo) {
    // this.setData({
    //   isShowBargainProgressWidth: false,  //关闭进度条
    // })
    const { startBargainPrice, buyNowPrice, lowestPrice, bargainAmount, originalPrice } = bargainInfo;
    const staticProgressWidth = (originalPrice - startBargainPrice) / (originalPrice - lowestPrice) * 100;
    const disOripStap = originalPrice - startBargainPrice //起砍价与一口价之间的差值(3.0版本返回的砍的金额会加上这个)
    const bargainProgressWidth = (bargainAmount - disOripStap) / (startBargainPrice - lowestPrice) * 100;
    const markerProgressWidth = (startBargainPrice - buyNowPrice) / (startBargainPrice - lowestPrice) * 100;
    setTimeout(() => {
      this.setData({
        'progressData.staticProgressWidth': staticProgressWidth,
        'progressData.bargainProgressWidth': bargainProgressWidth,
        'progressData.markerProgressWidth': markerProgressWidth,
        // isShowBargainProgressWidth: true  // 重新打开进度条
      });
      this.setMarkPriceAlignLeft('markPrice')
      this.setMarkPriceAlignLeft('dealAlignLeft')
      this.setMarkPriceAlignLeft('hasBargainNum')
    }, 100)
  },

  //是否设置里程碑提示居左显示
  setMarkPriceAlignLeft(id){
    const fieldById = {
      markPrice: 'markerAlignLeft',
      dealAlignLeft: 'dealAlignLeft',
      hasBargainNum: 'hasBargainNum',
      dealAlignRight: 'dealAlignRight'
    }
    util.getSystemInfoAsync().then(sysRes => {
      util.getDomInfoById(`#${id}`).then(res => {
        if (res && sysRes.screenWidth - res.right < 1) {
          this.setData({
            [`alignLeft.${fieldById[id]}`]: true,
          })
        } else if (res.left < 1 && id == 'dealAlignLeft'){
          this.setData({
            [`alignLeft.${fieldById[id]}`]: 'dealAlignRight',
          })
        }
      })
    })
  },

  // 判断是否砍价成功，成功改为支付场景
  checkIsSuccess() {
    let status = this.data.bargainInfo.status
    if (status < 4) {
      this.setData({
        scene: 2
      })
    }
  },

  

  // 分享自砍回调
  // shareBargainByOwnCallBack(bargainPrice) {
  //   this.setData({ 
  //     friendHelpBargainPage: 0,
  //     friendsBargainList: []
  //   })
  //   this.getBargainInfo();
  //   this.getNewestBuyPrice();
  //   this.getHelpBargainRecord();
  //   // this.handleDialogBargainRes('shareBargainByOwn', bargainPrice)
  // },

  // 记录分享记录
  addShare() {
    let addShareFormData = {
      goodsSn: this.data.goodsSn,
      goodsSkuSn: this.data.goodsSkuSn,
      brUuid: this.data.bargainInfo.brUuid,
      openId: app.globalData.openId,
    };
    business.addShare(addShareFormData)
  },


  /** 起砍价或一口价购买流程 start */
  //获取最新的购买金额
  getNewestBuyPrice(callback) {
    let formData = {
      openId: app.globalData.openId,
      brUuid: this.data.brUuid,
    };
    quick.requestGet({ url: 'getNewestBuyPrice' }, formData).then((res) => {
      const { code, data } = res.data;
      if (code !== 0) {
        var content = util.handleData(data, this.data.handlePriceField);
        this.setData({
          'buyNowConfig.buyNowType': code,
          'buyNowConfig.buyNowPrice': content.currentPrice,
          'buyNowConfig.bargainAmount': content.bargainAmount,
        })
        if (typeof (callback) == 'function') {
          callback()
        }
      } else {
        quick.showToastNone('获取信息失败')
      }
    })
  },
  //点击进行起砍价或一口价购买
  tabBuyNowPrice(){   
    let brUuid = this.data.brUuid
    business.getNewestBuyPrice(app, brUuid).then((res) => {
      let { code, data } = res.data
      data = util.handleData(data, this.data.handlePriceField);
      this.setData({
        'buyNowConfig.buyNowType': code,
        'buyNowConfig.buyNowPrice': data.currentPrice
      })
      // business.toggleBuyGoods(data, () => {
        business.startOrBuyNowPrice(app, brUuid).then(res => {
          this.setData({
            scrollTop: 0,
            scene: 2
          })
          this.getBargainInfo()
        })
      // })
    })
    this.getBargainInfo();//获取砍价详情
  },

  // 马上支付 【零元支付 | 一口价 | 起砍价 | 最低价】
  payNow(event) {
    business.saveFormId(app.globalData.openId, event.detail.formId)  //收集formId
    const { goodsSkuSn, goodsSn, brUuid } = this.data;
    wx.navigateTo({
      url: `/pages/consigneeAddress/consigneeAddress?goodsSn=${goodsSn}&goodsSkuSn=${goodsSkuSn}&brUuid=${brUuid}`,
    })
    // let { brUuid, goodsSn, goodsSkuSn } = this.data
    // let formData = {
    //   openId: app.globalData.openId,
    //   brUuid: brUuid,
    //   goodsSn: goodsSn,
    //   goodsSkuSn: goodsSkuSn,
    // }
    // business.checkStock(app, goodsSn, goodsSkuSn).then( () =>{
    //   // 零元支付
    //   if (this.data.bargainInfo.isZero) {
    //     this.payZero(formData);
    //   } else {
    //     this.paySubmit(formData);
    //   }
    // })
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

  /** 起砍价或一口价购买流程 end */

  //跳转到订单详情
  goToOrderDetail() {
    wx.redirectTo({
      url: '/pages/orderDetail/orderDetail?brUuid=' + this.data.brUuid
    })
  },

  // 时间倒计时结束,强制跳转到我的砍价列表
  goToBargainList() {
    quick.showToastNone('砍价结束')
    if(this.data.bargainInfo.status<4){
      this.setData({
        'bargainInfo.status': 9
      })
    }else{
      this.setData({
        'bargainInfo.status': 8
      })
    }
    
    setTimeout(() => {
      wx.redirectTo({
        url: '/pages/bargainList/bargainList'
      })
    }, 1500)
  },


  //判断是否设置返回页面首次分享弹框
  setShowModalShareMoreOne() {
    app.globalData.waiteShareGoods = {
      toggleFirstShareDialog: false,
      goodsSn: this.data.goodsSn,
      goodsSkuSn: this.data.goodsSkuSn,
      brUuid: this.data.bargainInfo.brUuid,
      shareConfig: ''
    }
    app.globalData.waiteShareGoods['shareConfig'] = this.setHelpShareConfig()
    // 判断是否砍超过一刀
    let { bargainNum, status } = this.data.bargainInfo;
    // shareResult 判定分享的结果
    if (bargainNum < 2 && status == 4 && this.data.shareResult) {
      app.globalData.waiteShareGoods.toggleFirstShareDialog = true
    }
  },

  //好友砍价与商品详情切换
  toggleTab(event) {
    business.saveFormId(app.globalData.openId, event.detail.formId)
    const tab = event.target.dataset.tab;
    if (tab == 1) {
      this.setData({
        // friendsBargainList: [],
        totalPages: 1,
        friendHelpBargainPage: 0,
      })
      this.data.friendsBargainList = [];
      this.getHelpBargainRecord();
    }
    this.setData({
      tabActive: tab
    })
  },

  // 滚动时不渲染计时器，以免造成页面闪动
  noCounter() {
    clearTimeout(this.data.drawTimer);
    this.data.drawTimer = setTimeout(() => {
      this.setData({
        isSetData: true
      })
    }, 100)

    this.setData({
      isSetData: false
    })
  },

  goConsigneeAddress() {
    wx.navigateTo({
      url: '/pages/consigneeAddress/consigneeAddress?',
    })
  },

  // 处理显示分享自砍或自砍两刀的结果
  handleDialogBargainRes(scene, price) {
    const sceneArr = ['shareBargainByOwn', 'twoBargainByOwn'];
    if (sceneArr.indexOf(scene) == -1 || !price) return;
    this.setData({
      'dialogBargainRes.isShow': true,
      'dialogBargainRes.scene': scene,
      'dialogBargainRes.price': price
    })
  },

  // 切换购买弹窗
  toggleDialogBuyNow() {
    this.setData({
      dialogBuyNow: !this.data.dialogBuyNow
    })
  }
})