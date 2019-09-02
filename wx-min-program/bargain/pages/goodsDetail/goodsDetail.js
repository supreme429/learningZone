// pages/goodsDetail/goodsDetail.js
const app = getApp();
const quick = require('../../utils/quick.js');
const business = require('../../utils/business.js');
const util = require('../../utils/util.js');
const { langs } = require('../../utils/langs.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    queue: ['getGoodsInfo', 'getBargainGoodsSkuVos'],
    completeQueue: [],
    fromShare: 0, // 0: 非分享;1: 来源分享;

    app: app,
    goodsSn: '',
    isShowModalBargainMoreOne: false,

    tabIndex: 0,
    specificationList: [], // 规格KPI
    specificationShowList: [], 
    specificationShowAll: false, // 是否显示全规格
    goodsRule: '',
    modalLoginShow: false, // 是否展示登录模块
    goodsPicUrls: [], // 商品banner图
    goodsName: "", // 商品名称
    goodsSubtitle: "", // 商品子名称
    bargainJoinNum: 0, // 砍价参与人数

    tabGoodsDetails: {}, // 商品详情选项卡
    tabSpecification: {}, // 规格参数选项卡

    goodsSharePicUrl: null, // 单纯分享商品的图片
    helpShareDesc: null, // 帮砍分享描述
    helpSharePicUrl: null, // 帮砍分享图片

    fieldToType: {
      goodsDetails: 'json',
      specification: 'json',
      goodsPicUrls: 'mllImg',
      pictureList: 'mllImg',
    },

    dialogBargainRes: { // 分享自砍或自砍两刀显示
      isShow: false,
      price: 0,
      scene: 'shareBargainByOwn'
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (!options.goodsSn) {
      quick.showToastNone('页面错误');
      return;
    }
    
    this.setData({
      goodsSn: options.goodsSn,
      fromShare: options.fromShare ? 1 : 0
    })
    quick.requestAll([this.getGoodsInfo(options.goodsSn), this.getBargainGoodsSkuVos(options.goodsSn)]);
  },

  onShow() {
    this.checkIsShowShareModal()  //检验是否弹首次分享框
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    let { sharePic, shareDesc } = app.globalData.minaShareInfo;
    if (res.from === 'button') {
      if (res.target.dataset.name == 'shareBargainMoreOne') {
        wx.showShareMenu({
          success: () => {
            let formData = {
              openId: app.globalData.openId,
              brUuid: app.globalData.waiteShareGoods.brUuid,
            }
            business.shareBargainByOwn(formData, this, 'isShowModalBargainMoreOne', '')
          }
        })
        if (app.globalData.waiteShareGoods) {
          app.globalData.waiteShareGoods.toggleFirstShareDialog = false
        }
        this.addShare() //记录分享记录
        return app.globalData.waiteShareGoods.shareConfig;
      } else if (res.target.dataset.name == "dialogBargainRes") {
        return app.globalData.waiteShareGoods.shareConfig;
      }

      const shareDetailConfig = {
        title: app.globalData.userShowInfo.nickName + '超值推荐【' + this.data.goodsName + '】',
        path: '/pages/goodsDetail/goodsDetail?fromShare=1&goodsSn=' + res.target.dataset.goodssn,
        imageUrl: this.data.goodsSharePicUrl || this.data.goodsPicUrls[0]
      }

      return shareDetailConfig;
    }
    return {
      title: shareDesc,
      imageUrl: this.data.goodsSharePicUrl || sharePic || this.data.goodsPicUrls[0] || '',
    }
  },

  // 检查首次加载是否完成
  checkLoadingComplate() {
    if (quick.checkLoadingComplate(this.data.queue, this.data.completeQueue)) {
      this.checkLoadingComplate = function() {};
    }
  },

  // 切换tab页
  changeTab(e){
    business.saveFormId(app.globalData.openId, e.detail.formId);
    this.setData({
      tabIndex: e.detail.target.dataset.index
    })
  },

  setSpecificationShowAll() {
    this.data.specificationShowAll = !this.data.specificationShowAll;
    this.setData({
      specificationShowAll: this.data.specificationShowAll,
    })
   
  },

  // 设置规格KPI
  setSpecificationList(e) {
    const b = this.data.specificationShowAll;
    this.setData({
      specificationShowList: b ? this.data.specificationList : this.data.specificationList.slice(0, 3)
    })
  },

  // 获取商品详情
  getGoodsInfo(goodsSn) {
    return quick.requestGet({ url: 'getGoodsInfo' }, {
      openId: app.globalData.openId,
      goodsSn
    }).then(res => {
      let { code, data } = res.data;
      if(code === 0) {
        data = util.handleData(data, this.data.fieldToType);
        this.setData({
          goodsPicUrls: data.goodsPicUrls,
          goodsName: data.goodsName,
          goodsSubtitle: data.goodsSubtitle,
          goodsRule: data.goodsRule,
          bargainJoinNum: data.bargainJoinNum,

          tabGoodsDetails: data.goodsDetails,
          pictureList: data.pictureList,
          tabSpecification: data.specification,

          helpShareDesc: data.helpShareDesc,
          helpSharePicUrl: data.helpSharePicUrl,
          goodsSharePicUrl: data.goodsSharePicUrl
        })
      }
    })
  },

  // 获取商品规格列表
  getBargainGoodsSkuVos(goodsSn) {
    return quick.requestGet({ url: 'getBargainGoodsSkuVos' }, {
      openId: app.globalData.openId,
      goodsSn
    }).then(res => {
      let { code, data } = res.data;

      if (code === 0) {
        data = util.handleDataByArray(data, { lowestPrice: 'price', originalPrice: 'price' });
        this.setData({
          specificationList: data
        });
        this.setSpecificationList();
      }
    })
  },

  // 发起砍价
  goBargain(e) {
    const { sn, skusn } = e.detail.target.dataset;
    
    business.saveFormId(app.globalData.openId, e.detail.formId);

    // 检测登录
    if (app.globalData.userShowInfo == null) {
      this.toggleModalLoginShow();
      return ;
    }

    this.checkGargainStatus(sn, skusn);
  },

  // 检测砍价状态
  checkGargainStatus(sn, sku) {
    quick.requestGet({ url: 'checkGargainStatus' }, {
      openId: app.globalData.appId,
      goodsSn: sn
    }).then(res => {
      const { code } = res.data;
      if(code === 0) {
        business.checkStock(app, sn, sku).then(() => {
          wx.navigateTo({
            url: `/pages/location/location?goodsSn=${sn}&goodsSkuSn=${sku}`,
          });
        })
      } else if (code === 1) {
        const title = '当前有未完成的砍价';
        const content = '该商品正在砍价中，快去邀请好友帮忙砍价吧';
        const confirmText = '查看详情';

        quick.toggleModal(
          title, 
          content,
          () => {
            wx.navigateTo({
              url: `/pages/bargainDetail/bargainDetail?goodsSn=${sn}&goodsSkuSn=${sku}`,
            })
          },
          confirmText
        )
      } else {
        quick.showToastNone(langs.bargainFail);
      }
    })
  },

  toggleModalLoginShow() {
    wx.setNavigationBarTitle({
      title: !this.data.modalLoginShow ? '登录' : '商品详情'
    })
    this.setData({
      modalLoginShow: !this.data.modalLoginShow
    })
  },

  toggleModal() {
    this.setData({
      isShowModalBargainMoreOne: !this.data.isShowModalBargainMoreOne
    })
    app.globalData.waiteShareGoods.toggleFirstShareDialog = false;
  },

  // 检验是否弹首次分享框
  checkIsShowShareModal() {
    let waiteShareGoods = app.globalData.waiteShareGoods
    if (waiteShareGoods && waiteShareGoods.toggleFirstShareDialog) {
      this.setData({
        isShowModalBargainMoreOne: !this.data.isShowModalBargainMoreOne
      })
    }
  },

  //记录分享记录
  addShare() {
    const { goodsSn, goodsSkuSn, brUuid } = app.globalData.waiteShareGoods
    let addShareFormData = {
      goodsSn: goodsSn,
      goodsSkuSn: goodsSkuSn,
      brUuid: brUuid,
      openId: app.globalData.openId
    };
    business.addShare(addShareFormData)
  },
})