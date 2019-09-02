// pages/helpBargainDetail/helpBargainDetail.js
const quick = require('../../utils/quick.js')
const util = require('../../utils/util.js')
const { langs } = require('../../utils/langs.js')
const business = require('../../utils/business.js')
const { appName } = require('../../config/config.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    countTimeNum: 0,
    initiatorOpenId: '',  //发起砍价人openId
    
    helpRes: null,
    // {
    //   goodsStatus: '0', // 商品状态 0: 已结束，1: 未结束
    //   bargainStatus: '1', // 砍价状态 1: 砍价中，2: 砍价失败，3: 砍价成功，4: 砍价取消
    //   helpStatus: '1', // 帮砍状态 0: 帮砍失败，1: 帮砍成功，2: 无人帮砍
    //   cutAmount: '15', // 好友帮砍金额
    //   helpBrUuid: '', // 帮砍好友砍价记录brUuid
    //   helpPeopleNum: '20', // 帮砍人数（不包含发起人）
    //   helpBargainAmount: '100', // 累计帮砍金额
    //   currentPrice: '10', // 购买价
    //   isHelp: 0, // 是否已帮砍 0: 第一次帮砍，1: 已帮砍
    // }, // 帮砍结果
    role: '', // own: 自己; friend: 好友;
    
    brUuid: '', // 发起人的砍价单ID
    goodsSn: '',
    goodsSkuSn: '',
    bargainInfo: {},  //砍价详情
    goodsInfo: {},
    sHeight: 0,
    recommendGoods: [], // 更多砍价商品
    friendsBargainList: [], // 好友砍价列表
    friendHelpBargainPage: 0,
    totalPages: 1,
    //处理价格的字段配置
    handlePriceField: {
      originalPrice: 'price',
      lowestPrice: 'price',
      cutAmount: 'price',
      bargainAmount: 'price',
      buyNowPrice: 'price',
      startBargainPrice: 'price',
      helpBargainAmount: 'price',
      specification: 'json',
      goodsDetails: 'json',
      pictureList: 'mllImg',
    },
    tabActive: 1, //1:好友砍价，2:商品详情
    modalLoginShow: false, // 是否展示登录模块

    drawTimer: null, // 计时器定时器事件
    isSetData: true,
    isShowDialogMoveHelpBargain: false,
    showResult: false, //弹完框后再显示结果
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (!options.brUuid && !options.goodsSn && !options.goodsSkuSn && !options.initiatorOpenId) {
      quick.showToastNone('页面错误！');
      return;
    }

    this.setData({
      brUuid: options.brUuid,
      goodsSn: options.goodsSn,
      goodsSkuSn: options.goodsSkuSn,
      initiatorOpenId: options.initiatorOpenId,
    })

    
  },

  onReady() {
    // 设置滚动条高度
    util.getSystemInfoAsync().then(res => {
      this.setData({
        sHeight: res.windowHeight + 'px'
      })
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.init();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: app.globalData.minaShareInfo.shareDesc || appName,
      path: '/pages/index/index',
      imageUrl: app.globalData.minaShareInfo.sharePic || ''
    }
  },

  /**
   * 页面初始化
   * 获取 帮砍 | 商品详情 | 砍价详情 | 帮砍记录
   */
  init() {
    if (!app.globalData.openId) {
      setTimeout(() => {
        this.init();
      }, 100)
      return;
    };

    // 设定帮砍人与发起砍价的人的角色
    this.setData({
      role: this.data.initiatorOpenId == app.globalData.openId ? 'own' : 'friend'
    })
    
    this.getBargainInfo()
    this.getGoodsInfo();
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
      openId: this.data.initiatorOpenId,
      brUuid: this.data.brUuid,
      goodsSn: this.data.goodsSn,
      goodsSkuSn: this.data.goodsSkuSn
    };

    quick.requestGet({ url: 'getBargainInfo' }, formData).then((res) => {
      const { code, data } = res.data;
      if (code === 0) {
        // 待支付状态且为本人点开链接
        if(data.status < 4 && this.data.role === 'own') {
          this.goToBargainDetail();
        }
        var content = util.handleData(data, this.data.handlePriceField);
        content['countTimeNum'] = content.bargainEndTime - content.nowTime;
        content['payCountTime'] = content.payEndTime - content.nowTime;
        this.setData({
          bargainInfo: content,
        })
      }
      this.helpBargain()
    })
  },

  //获取帮砍记录
  getHelpBargainRecord() {
    //判断总页数
    if (this.data.totalPages < this.data.friendHelpBargainPage + 1) return;

    let formData = {
      openId: this.data.initiatorOpenId,
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
          totalPages: data.totalPages
        })
      }
    })
  },

  // 帮砍
  helpBargain() {
    // 检验是否存在用户信息
    if (app.globalData.userShowInfo == null) {
      console.log('userShowInfo null')
      this.toggleModalLoginShow();
      return;
    }

    var formData = {
      openId: app.globalData.openId,
      brUuid: this.data.brUuid,
      initiatorOpenId: this.data.initiatorOpenId
    }

    quick.requestPost({ url: 'helpBargain' }, formData).then((res) => {
      // 帮砍成功，显示手滑弹框(第一次进入)
      let { code, data } = res.data;
      if (code === 0) {
        // 角色为本人且处于砍价中时，跳转到砍价详情
        if (this.data.role == 'own' && data.goodsStatus == 1 && data.bargainStatus == 1) {
          this.goToBargainDetail();
          return;
        }
        data = util.handleData(data, { cutAmount: 'price', helpBargainAmount: 'price', currentPrice: 'price' });
        this.data.friendsBargainList = [];
        this.setData({
          friendHelpBargainPage: 0,
          friendsBargainList: [],
          isShowDialogMoveHelpBargain: data.isHelp == 1 || data.isHelp == null ? false : true,
          helpBrUuid: data.helpBrUuid || '',
          showResult: data.isHelp ? true : false,
          helpRes: data,
        })
        
        // 首次帮砍打开弹框动画
        if (data.isHelp == 0) {
          this.toggleDialogMoveHelpBargain()  //3秒后关闭弹框
        }
      }
      
      this.getHelpBargainRecord(); // 重新获取帮砍记录
    })
  },

  toggleDialogMoveHelpBargain(){
    setTimeout(() => {
      this.setData({
        isShowDialogMoveHelpBargain: false,
        showResult: true
      })
    }, 3000)
  },

  tabCheckGargainStatus() {
    let { goodsSn, goodsSkuSn } = this.data
    this.checkGargainStatus(() => {
      business.checkStock(app, goodsSn, goodsSkuSn, 'twoBargainByOwn').then( () => {
        wx.navigateTo({
          url: `/pages/location/location?scene=twoBargainByOwn&goodsSn=${goodsSn}&goodsSkuSn=${goodsSkuSn}`,
        })
      })
    })
  },

  // 校验我是否对该商品发起过砍价
  checkGargainStatus(callback) {
    let formData = {
      openId: app.globalData.openId,
      goodsSn: this.data.goodsSn,
    }
    quick.requestGet({ url: 'checkGargainStatus' }, formData).then((res) => {
      const { code, data } = res.data;
      if (code === 0) {
        if (typeof(callback) == 'function') {
          callback()
        }
      } else {
        this.setData({
          helpBrUuid: data && data.ownBrUuid || ''
        })
        this.toggleModalBargaining()
      }
    })
  },

  toggleModalBargaining: function () {
    var title = '当前有未完成的砍价';
    var content = '该商品正在砍价中，快去邀请好友帮忙砍价吧';
    var confirmText = '查看详情';
    quick.toggleModal(title, content, () => { this.goToBargainDetail(this.data.helpBrUuid) }, confirmText)
  },

  goToBargainDetail(helpBrUuid, callback) {
    wx.redirectTo({
      url: `/pages/bargainDetail/bargainDetail?brUuid=${helpBrUuid || this.data.brUuid}&goodsSn=${this.data.goodsSn}&goodsSkuSn=${this.data.goodsSkuSn}&fromShare=1`,
      success: () =>{
        if(typeof(callback)=='function'){
          callback()
        }
      }
    })
  },


  //跳到首页
  goToIndex(){
    wx.redirectTo({
      url: '/pages/index/index',
    })
  },

  //好友砍价与商品详情切换
  toggleTab(event) {
    business.saveFormId(app.globalData.openId, event.detail.formId)
    const tab = event.target.dataset.tab;
    if (tab == 1) {
      this.setData({
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

  // 切换登录
  toggleModalLoginShow() {
    this.setData({
      modalLoginShow: !this.data.modalLoginShow
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

  
})