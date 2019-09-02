//index.js
//获取应用实例
const quick = require ('../../utils/quick.js')
const business = require('../../utils/business.js')
const util = require('../../utils/util.js')
const { appName } = require('../../config/config.js')
const app = getApp()

Page({
  data: {
    bannerConfig: {
      indicatorDots: false, //是否显示面板指示点
      autoplay: true, //是否自动切换
      interval: 4000,
      duration: 500,
      index: 0,
      bannerList:[]
    },
    goodsList: [],
    //处理价格的字段配置
    handlePriceField:{
      originalPrice: 'price',
      lowestPrice: 'price',
      goodsPicUrl: 'mllImg'
    },
    getGoodsFormData: {
      page: 0,
      size: 10,
    },
    totalPages: 1, //总页数
    systemInfo: {}, //系统参数，含屏幕高度等
    loginState: false, //登录状态
    modalLoginShow: false, // 是否展示登录模块
    isShowModalBargainMoreOne: false, 

    dialogBargainRes: { // 分享自砍或自砍两刀显示
      isShow: false,
      price: 0,
      scene: 'shareBargainByOwn'
    },
    dialogClassifyStatus: 'inner',
    classifyConfig: {
      curClassifyName: '分类',  //当前选择的分类名称
      curClassifyId: '',  //当前选择的分类id
      type: '1',  //当前分类级别
    },
    searchType: 1,  //1:全部，2: 热门预售， 3：分类
    showNoGoodsModule: false, //是否显示没有商品模块
  },

  //swiper改变事件
  changeSwiper: function(event){
    this.setData({
      'bannerConfig.index.': event.detail.current,
    })
  },

  getBannerList(){
    if (!app.globalData.openId) {
      setTimeout(() => {
        this.getBannerList()
      }, 100)
      return;
    }
    const data = {
      openId: app.globalData.openId,
    }
    quick.requestGet({ url: 'getBannerList' }, data).then((res) => {
      const { code, data } = res.data;
      if (code === 0) {
        this.setData({
          'bannerConfig.bannerList': data,
        })
      }
    })
  },

  // 设置是否显示没有商品模块
  toggleNoGoodsModule(){
    if(this.data.goodsList.length<1){
      this.setData({
        showNoGoodsModule: true
      })
    }
  },
  //隐藏没有商品模块
  hideNoGoodsModule(){
    this.setData({
      showNoGoodsModule: false
    })
  },

  //分页获取商品列表数据
  getGoodsListNextPage: function(){  
    this.hideNoGoodsModule() 
    if(!app.globalData.openId){
      setTimeout(()=>{
        this.getGoodsListNextPage()
      },10)
      return;
    }

    //判断总页数与当前页数
    if (this.data.totalPages < this.data.getGoodsFormData.page+1) return;

    const data = {
      openId:app.globalData.openId,
      page: this.data.getGoodsFormData.page++
    }
    quick.requestGet({ url: 'getGoodsList' }, data).then((res) => {
      const { code, data } = res.data;
      this.formatResPrice(data.content)
      if (code === 0) {
        wx.hideLoading()
        this.setData({
          goodsList: this.data.goodsList.concat(data.content),
          totalPages: data.totalPages
        })
        this.toggleNoGoodsModule()
      }
    })
  },

  //获取热门预售商品
  getReadyGoods(){
    //判断总页数与当前页数
    if (this.data.totalPages < this.data.getGoodsFormData.page + 1) return;

    const data = {
      openId: app.globalData.openId,
      page: this.data.getGoodsFormData.page++
    }
    quick.requestGet({ url: 'getReadyGoods' }, data).then((res) => {
      const { code, data } = res.data;
      this.formatResPrice(data.content)
      if (code === 0) {
        wx.hideLoading()
        this.setData({
          goodsList: this.data.goodsList.concat(data.content),
          totalPages: data.totalPages
        })
        this.toggleNoGoodsModule()
      }
    })
  },

  //改变导航栏搜索
  changeSearchType(e,searchType){
    let tempType = e.currentTarget.dataset.searchtype
    let curSearchType = tempType ? tempType : searchType

    //判断是否点击当前
    if (this.data.searchType == tempType) return;

    wx.showLoading({
      title: '',
    })
    this.hideNoGoodsModule() 
    this.setData({
      searchType: curSearchType,
      'getGoodsFormData.page': 0,
      totalPages: 1,
      goodsList: [],
      'classifyConfig.type': 1,
      'classifyConfig.curClassifyName': '分类'
    })
    switch (curSearchType){
      case '1':
        this.getGoodsListNextPage();
        break;
      case '2':
        this.getReadyGoods();
      case '3':
        break;
    }

    //重置弹框
    this.selectComponent('#dialogClassify').reset()
  },

  //开售提醒
  setRemind(e){
    let {index, goodssn} = e.currentTarget.dataset
    const data = {
      openId: app.globalData.openId,
      goodsSn: goodssn
    }
    quick.requestPost({ url: 'setRemind' }, data).then((res)=>{
      const { code, data } = res.data;
      let setFollowStatusStr = 'goodsList[' + index + '].followStatus'
      if (code === 0){
        quick.showToastNone('已关注')
        this.setData({
          [setFollowStatusStr]: '1'
        })
      }
    })

    //收集formId
    business.saveFormId(app.globalData.openId, e.detail.formId)
  },

  //取消关注
  cancelRemind(e){
    let { index, goodssn } = e.currentTarget.dataset
    const data = {
      openId: app.globalData.openId,
      goodsSn: goodssn
    }
    quick.requestPost({ url: 'cancelRemind' }, data).then((res) => {
      const { code, data } = res.data;
      let setFollowStatusStr = 'goodsList[' + index + '].followStatus'
      if (code === 0) {
        quick.showToastNone('已取消关注')
        this.setData({
          [setFollowStatusStr]: '0'
        })
      }
    })

    //收集formId
    business.saveFormId(app.globalData.openId, e.detail.formId)
  },

  //处理返回数据的价格
  formatResPrice(data){
    for(let i=0;i<data.length; i++){
      data[i] = util.handleData(data[i], this.data.handlePriceField);
    }
  },

  //跳转到web-view
  gotoThirdPage(e){
    const { linktype, linkurl, goodssn, goodsskusn, bruuid, bargainstatus, stock, goodsstatus} = e.currentTarget.dataset
    
    if (linktype == 1){
      if (bargainstatus == 1) {
        this.toggleModalBargaining(goodssn, goodsskusn, bruuid)
        return;
      }
      //判断是否开始
      if (goodsstatus==0){
        quick.showToastNone('该商品活动还未开始');
        return;
      }
      //库存为零，不能跳转
      if(stock<1){
        quick.showToastNone('该商品已被抢光');
        return;
      }

      wx.navigateTo({
        url: '/pages/goodsDetail/goodsDetail?goodsSn=' + goodssn,
        success: function () {
        }
      })
    }else{
      wx.navigateTo({
        url: '/pages/thirdPage/thirdPage?url=' + linkurl,
        success: function () {
        }
      })
    }
  },

  //跳到商品详情页
  goToGoodsDetail: function(e){
    const { goodssn, goodsskusn,bruuid, bargainstatus } = e.currentTarget.dataset
    if (bargainstatus==1){
      this.toggleModalBargaining(goodssn, goodsskusn, bruuid)
      return;
    }
    wx.navigateTo({
      url: '/pages/goodsDetail/goodsDetail?goodsSn=' + goodssn,
      success: function () {
        
      }
    })
  },
  //改变登录状态
  changeLoginState(){
    this.setData({
      loginState: true
    })
  },

  //点右上角分享按钮，不能分享，条砍价详情
  cantShare(event){
    let { goodssn, goodsskusn, bruuid } = event.currentTarget.dataset;
    this.toggleModalBargaining(goodssn, goodsskusn, bruuid);
  },

  toggleModalBargaining: function (goodsSn, goodsSkuSn, brUuid){
    var title = '当前有未完成的砍价';
    var content = '该商品正在砍价中，快去邀请好友帮忙砍价吧';
    var confirmText = '查看详情';
    quick.toggleModal(title, content, this.goToBargainDetail(goodsSn, goodsSkuSn, brUuid), confirmText, '取消', true, '')
  },

  //查看砍价详情
  goToBargainDetail: function (goodsSn, goodsSkuSn, brUuid){
    return function(){
      wx.navigateTo({
        url: '/pages/bargainDetail/bargainDetail?goodsSn=' + goodsSn + '&goodsSkuSn=' + goodsSkuSn + '&brUuid=' + brUuid,
        success: function () {

        }
      })
    }
  },

  //显示分类弹框
  toggleDialogClassify(){
    let status = this.data.dialogClassifyStatus=='outer'? 'inner' : 'outer'
    this.setData({
      dialogClassifyStatus: status
    })
    if (status == 'outer'){
      this.selectComponent('#dialogClassify').initCurData()
    }
  },

  //保存选中的分类
  saveSelectClassify(e){
    wx.showLoading({
      title: '',
    })
    this.hideNoGoodsModule()
    let { curClassifyName, curClassifyId, type} = e.detail
    if (curClassifyId === undefined || curClassifyId === '') return;

    this.toggleDialogClassify()

    this.setData({
      searchType: 3,
      goodsList: [],
      totalPages: 1,
      'classifyConfig.curClassifyName': curClassifyName,
      'classifyConfig.curClassifyId': curClassifyId,
      'classifyConfig.type': type,
      'getGoodsFormData.page': 0
    })
    this.getGoodsByClassifyId(curClassifyId, type)
  },

  getGoodsByClassifyId(curClassifyId, type){
    const data = {
      classifyId: curClassifyId,
      type: type,
      openId: app.globalData.openId,
      page: this.data.getGoodsFormData.page++,
    }
    quick.requestGet({ url: 'getGoodsByClassifyId' }, data).then((res) => {
      const { code, data } = res.data;
      this.formatResPrice(data.content)
      if (code === 0) {
        wx.hideLoading()
        this.setData({
          goodsList: this.data.goodsList.concat(data.content),
          totalPages: data.totalPages
        })
        this.toggleNoGoodsModule()
      }
    })
  },

  //切换登录
  toggleModalLoginShow() {
    this.setData({
      modalLoginShow: !this.data.modalLoginShow
    })
  },
  //切换首次分享弹框
  toggleModal() {
    this.setData({
      isShowModalBargainMoreOne: !this.data.isShowModalBargainMoreOne
    })
    app.globalData.waiteShareGoods.toggleFirstShareDialog = false
  },
  // 检验是否弹首次分享框
  checkIsShowShareModal() {
    console.log('checkIsShowShareModal')
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
      goodsSkuSn: tgoodsSkuSn,
      brUuid: brUuid,
      openId: app.globalData.openId
    };
    business.addShare(addShareFormData)
  },

  onShow: function(){
    if (app.globalData.userShowInfo){
      this.setData({
        loginState: true
      })
    }
    wx.showLoading({
      title: ''
    })
    this.setData({
      'getGoodsFormData.page': 0,
      goodsList: [],
      searchType: this.data.searchType==3? 3: 1,
    })
    //从分类栏出去，回到分类栏
    if (this.data.searchType == 3){
      let { type, curClassifyId } = this.data.classifyConfig
      this.getGoodsByClassifyId(curClassifyId, type);
    }else{
      this.checkIsShowShareModal()  //检验是否弹首次分享框
      //重置分类弹框
      this.selectComponent('#dialogClassify').reset()
    }
    this.getGoodsListNextPage();
  },

  onLoad: function(){
    this.setData({
      systemInfo: util.getSystemInfo()
    })
    this.getBannerList();
  },

  //转发
  onShareAppMessage: function (res){
    if (res.from === 'button'){
      if (res.target.dataset.name == 'shareBargainMoreOne'){
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

      var shareDetailConfig = {
        title: app.globalData.userShowInfo.nickName + '超值推荐【' + res.target.dataset.goodsname + '】',
        path: '/pages/goodsDetail/goodsDetail?fromShare=1&goodsSn=' + res.target.dataset.goodssn,
        imageUrl: res.target.dataset.goodsSharePicUrl || res.target.dataset.goodspicurl
      }
      return shareDetailConfig;
    }else{
      var shareMinaConfig = {
        title: app.globalData.minaShareInfo.shareDesc || appName,
        path: '/pages/index/index',
        imageUrl: app.globalData.minaShareInfo.sharePic || ''
      }
      return business.share(res, shareMinaConfig)
    }
  } 
})
