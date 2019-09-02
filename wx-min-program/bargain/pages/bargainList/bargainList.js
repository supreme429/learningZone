// pages/bargainList/bargainList.js
const app = getApp()
const util = require('../../utils/util.js')
const quick = require('../../utils/quick.js')
const { langs } = require('../../utils/langs.js')
const business = require('../../utils/business.js')
const { appName } = require('../../config/config.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsList: [],
    totalPages: 1,
    //处理价格的字段配置
    handlePriceField: {
      originalPrice: 'price',
      lowestPrice: 'price',
      startBargainPrice: 'price',
      buyNowPrice: 'price',
      cutAmount: 'price',
      distanceLowest: 'price',
      buyResultPrice: 'price',  //购买价格
      goodsPicUrl: 'mllImg'
    },
    systemInfo: {},
    page: 0, // 页码
    translateX: {
      
    },
    moveId: '', //当前滑动的商品id
    translateDelX: {
      
    },
    delBtnWidth: 250,
    state: {  //删除按钮缩进状态
      
    },
    goodsItemHeight:{}, //动态设置可删除列表的高度,解决高度不固定问题
    isShowModalBargainMoreOne: false, 
    statusLang: {
      1: '起砍价购买,待付款',
      2: '一口价购买,待付款',
      3: '砍价成功,待付款',
      4: '',
      5: '已支付,待发货',
      6: '已支付,已发货',
      7: '已完成',
      8: '砍价失败',
      9: '未支付,已取消'
    },
    stopCountTime: false,   //是否执行倒计时，false：执行，ftrue不执行

    dialogBargainRes: { // 分享自砍或自砍两刀显示
      isShow: false,
      price: 0,
      scene: 'shareBargainByOwn'
    },
  },

  //获取我的砍价商品列表
  getMyBargainRecord(){
    //判断总页数
    if (this.data.page + 1 > this.data.totalPages) return;

    const data = {
      page: this.data.page++,
      openId: app.globalData.openId
    }
    quick.requestGet({ url: 'getMyBargainRecord' }, data).then((res) => {
      let { code, data } = res.data;
      if (code === 0) {
        wx.hideLoading()
        data.content = util.handleDataByArray(data.content, {
          'currentPrice': 'price'});
        this.handleCountTimeAndPrice(data.content);

        this.formatResPrice(data.content);
        this.initTranslateX(data.content);
        this.setData({
          totalPages: data.totalPages,
          goodsList: this.data.goodsList.concat(data.content),
        })
        this.goToIndex()
        this.setGoodsItemHeight();
      }
    })
  },

  //设置goodsItemHeight的高度
  setGoodsItemHeight(){
    wx.createSelectorQuery().selectAll('.positonItemContent').boundingClientRect((rects) => {
      rects.forEach( (rect) => {
        let id = rect.dataset.id
        let goodsItemHeightStr = 'goodsItemHeight.' + id
        this.setData({
          [goodsItemHeightStr]: rect.height
        })
      })
    }).exec()
  },

  //当goodsList没有，回到首页
  goToIndex(){
    if (this.data.goodsList.length<1){
      quick.showToastNone(langs.noMyBargainGoods, 3000)
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/index/index',
          success: () => {
          }
        })
      }, 3000)      
    }
  },

  //初始化删除按钮位移及缩进状态
  initTranslateX(data){
    for (let i = 0; i < data.length; i++) {
      let translateXStr = 'translateX.' + data[i].id;
      let translateDelXStr = 'translateDelX.' + data[i].id;
      let stateStr = 'state.' + data[i].id
      this.setData({
        [translateXStr]: 0,
        [translateDelXStr]: this.data.delBtnWidth,
        [stateStr]: 'inner'
      })
    }
  },

  //处理返回数据的价格
  formatResPrice(data) {
    for (let i = 0; i < data.length; i++) {
      data[i] = util.handleData(data[i], this.data.handlePriceField);
    }
  },
  //处理砍价和支付结束时间
  handleCountTimeAndPrice(data){
    for (let i = 0; i < data.length; i++){
      let { bargainTimeLimit, startBargainTime, nowTime, endTime, startBargainPrice, lowestPrice, cutAmount, buyNowPrice, originalPrice, payTimeLimit, bargainSuccessTime } = data[i]
      if (data[i].status == 4){
        let endTimeTwo = bargainTimeLimit * 3600 * 1000 + startBargainTime
        data[i]['countTimeStamp'] = (endTimeTwo - endTime > 0) ? (endTime - nowTime) : (endTimeTwo - nowTime)
        data[i]['distanceLowest'] = originalPrice - lowestPrice - cutAmount
        data[i]['buyResultPrice'] = cutAmount > startBargainPrice - buyNowPrice ? startBargainPrice - cutAmount : startBargainPrice
      }
      if (data[i].status < 4){
        let payEndTimeTwo = payTimeLimit * 3600 * 1000 + bargainSuccessTime
        data[i]['countTimeStamp'] = payEndTimeTwo - nowTime
      }
    }
  },

  //跳到页
  gotoNavigate(event){
    let { goodssn, goodsskusn, ingbruuid, bargainagain, status } = event.target.dataset
    //取消和失败情况下能否重砍 bargainagain == 0不能重砍
    if (bargainagain == 0 && (status == 8 || status==9)){
      if (ingbruuid){
        this.toggleModalBargaining(goodssn, goodsskusn, ingbruuid)
      }else{
        this.toggleModalGoIndex()
      }
      return;
    }
    wx.navigateTo({
      url: event.target.dataset.url,
      success: function () {

      }
    })
    //收集formId
    business.saveFormId(app.globalData.openId, event.detail.formId)
  },

  //重砍，库存为0或砍价结束弹框引导去到首页
  toggleModalGoIndex(){
    let content = '很抱歉，该商品已被抢光，点击“确定”去看看其他商品吧。'
    quick.toggleModal('', content, this.goIndexNoToast, '确定', '取消', false, '')
  },

  toggleModalBargaining: function (goodsSn, goodsSkuSn, brUuid) {
    var title = '当前有未完成的砍价';
    var content = '该商品正在砍价中，快去邀请好友帮忙砍价吧';
    var confirmText = '查看详情';
    quick.toggleModal(title, content, this.goToBargainDetail(goodsSn, goodsSkuSn, brUuid), confirmText, '取消', true, '')
  },

  //跳到首页无toast
  goIndexNoToast(){
    wx.redirectTo({
      url: '/pages/index/index',
      success: function () {
        
      }
    })
  },

  //查看砍价详情
  goToBargainDetail: function (goodsSn, goodsSkuSn, brUuid) {
    return function () {
      wx.navigateTo({
        url: '/pages/bargainDetail/bargainDetail?goodsSn=' + goodsSn + '&goodsSkuSn=' + goodsSkuSn + '&brUuid=' + brUuid,
        success: function () {

        }
      })
    }
  },

  tabGetNewestBuyPrice(event){
    let { bruuid,url,index } = event.target.dataset
    business.getNewestBuyPrice(app, bruuid,url).then((res)=>{
      let { code, data } = res.data;
      data = util.formatPrice(data.currentPrice)
      let buyResultPriceStr = 'goodsList[' + index + '].buyResultPrice'
      this.setData({
        [buyResultPriceStr]: data
      })
      business.toggleBuyGoods(data, ()=>{
        business.startOrBuyNowPrice(app, bruuid).then(res => {
          wx.navigateTo({
            url: url
          })
        })
      })
    })

    //收集formId
    business.saveFormId(app.globalData.openId, event.detail.formId)
  },


  /** 起砍价或一口价购买流程 start */

  //改变砍价状态
  changeBargainState(e){
    let status = this.data.goodsList[e.detail.index].status
    let statusStr = 'goodsList[' + e.detail.index + '].status'
    let resultStatus;
    switch (status) {
      case '4':
        resultStatus = '8'
        break;
      case '1': case '2': case '3':
        resultStatus = '9'
        break;
      default:
        return
    }
    this.setData({
      [statusStr]: resultStatus
    })
  },

  //删除砍价记录
  delBargainRecord(e){
    var index = e.target.dataset.index;
    let { goodsSn, goodsSkuSn, brUuid } = this.data.goodsList[index]
    const formData = {
      openId: app.globalData.openId,
      goodsSn: goodsSn,
      goodsSkuSn: goodsSkuSn,
      brUuid: brUuid,
    }
    quick.requestPost({ url: 'delBargain' }, formData).then((res) => {
      const { code, data } = res.data;
      if (code === 0) {
        this.data.goodsList.splice(index, 1)
        this.setData({
          goodsList: this.data.goodsList
        })
      }
    })
  },

  toggleModal(){
    this.setData({
      isShowModalBargainMoreOne: !this.data.isShowModalBargainMoreOne
    })
    app.globalData.waiteShareGoods.toggleFirstShareDialog = false;
  },

  // 检验是否弹首次分享框
  checkIsShowShareModal(){
    let waiteShareGoods = app.globalData.waiteShareGoods
    if (waiteShareGoods && waiteShareGoods.toggleFirstShareDialog){
      this.setData({
        isShowModalBargainMoreOne: !this.data.isShowModalBargainMoreOne
      })
    }
  },

  //记录分享记录
  addShare() {
    const { goodsSn, goodsSkuSn, brUuid} = app.globalData.waiteShareGoods
    let addShareFormData = {
      goodsSn: goodsSn,
      goodsSkuSn: goodsSkuSn,
      brUuid: brUuid,
      openId: app.globalData.openId
    };
    business.addShare(addShareFormData)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      systemInfo: util.getSystemInfo()
    })
  },

  //监听页面显示
  onShow: function(){
    this.setData({
      page: 0,
      goodsList: [],
      stopCountTime: false
    })
    wx.showLoading({
      title: ''
    })
    this.getMyBargainRecord();
    this.checkIsShowShareModal()  //检验是否弹首次分享框
  },

  onHide:function(){
    this.setData({
      stopCountTime: true
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      if (res.target.dataset.name == "dialogBargainRes") {
        return app.globalData.waiteShareGoods.shareConfig;
      }
      wx.showShareMenu({
        success: () => {
          let formData = {
            openId: app.globalData.openId,
            brUuid: app.globalData.waiteShareGoods.brUuid
          }
          this.setData({
            page: 0,
            goodsList: []
          })
          this.addShare()
          app.globalData.waiteShareGoods.toggleFirstShareDialog = false;
          business.shareBargainByOwn(formData, this, 'isShowModalBargainMoreOne', this.getMyBargainRecord)
        }
      })
      return app.globalData.waiteShareGoods.shareConfig;
    }else{
      let minaShareInfo = app.globalData.minaShareInfo
      return {
        title: minaShareInfo.shareDesc ? minaShareInfo.shareDesc : appName,
        path: '/pages/index/index',
        imageUrl: minaShareInfo.sharePic ? minaShareInfo.sharePic : ''
      }
    }
  },
  //开始触摸事件
  touchS: function (e) {
    var translateXStr = 'translateX.' + this.data.moveId
    var translateDelXStr = 'translateDelX.' + this.data.moveId
    var stateStr = 'state.' + this.data.moveId
    if (e.touches.length == 1) {
      if (this.data.moveId != e.currentTarget.dataset.id && this.data.moveId!=''){
        this.setData({
          [translateXStr]: 0,
          [translateDelXStr]: this.data.delBtnWidth,
          [stateStr]: 'inner'
        })
      }
      this.setData({
        //设置触摸起始点水平方向位置
        startX: e.touches[0].clientX,
        moveId: e.currentTarget.dataset.id
      });
    }
  },
  //触摸移动事件
  touchM: function (e) {
    var translateXStr = 'translateX.' + this.data.moveId;
    var translateDelXStr = 'translateDelX.' + this.data.moveId
    var stateStr = 'state.' + this.data.moveId
    if (e.touches.length == 1) {
      //手指移动时水平方向位置
      var moveX = e.touches[0].clientX;
      //手指起始点位置与移动期间的差值
      var disX = this.data.startX - moveX;
      var delBtnWidth = this.data.delBtnWidth;
      if (disX > 0) {//移动距离大于0，文本层left值等于手指移动距离
        if (this.data.state[this.data.moveId] == 'outer') return;
        if (disX > delBtnWidth) {
          this.setData({
            [translateXStr]: delBtnWidth,
            [translateDelXStr]: 0,
          })
          return;
        }
        this.setData({
          [translateXStr]: disX,
          [translateDelXStr]: this.data.delBtnWidth - disX,
        })
      } else if (disX < 0) {
        if (this.data.translateX[this.data.moveId] < 1) return;
        if (Math.abs(disX) > delBtnWidth) {
          this.setData({
            [translateXStr]: 0,
            [translateDelXStr]: this.data.delBtnWidth,
          })
          return;
        }
        this.setData({
          [translateXStr]: this.data.delBtnWidth + disX,
          [translateDelXStr]: -disX
        })
      }
    }
  },
  //触摸结束事件
  touchE: function (e) {
    var translateXStr = 'translateX.' + this.data.moveId;
    var translateDelXStr = 'translateDelX.' + this.data.moveId
    var stateStr = 'state.' + this.data.moveId
    if (e.changedTouches.length == 1) {
      //手指移动结束后水平位置
      var endX = e.changedTouches[0].clientX;
      //触摸开始与结束，手指移动的距离
      var disX = this.data.startX - endX;
      var delBtnWidth = this.data.delBtnWidth;
      //如果距离小于删除按钮的1/2，不显示删除按钮
      if (Math.abs(disX) < delBtnWidth / 2) {
        if (this.data.state[this.data.moveId] == 'inner') {
          this.setData({
            [translateXStr]: 0,
            [translateDelXStr]: this.data.delBtnWidth
          })
        } else {
          this.setData({
            [translateXStr]: this.data.delBtnWidth,
            [translateDelXStr]: 0
          })
        }
      } else {
        if (this.data.state[this.data.moveId] == 'inner') {
          if (disX < 0) return;
          this.setData({
            [translateXStr]: this.data.delBtnWidth,
            [translateDelXStr]: 0,
            [stateStr]: 'outer'
          })
        } else {
          if (disX > 0) return;
          this.setData({
            [translateXStr]: 0,
            [translateDelXStr]: this.data.delBtnWidth,
            [stateStr]: 'inner'
          })
        }
      }
    }
  },

})