// miniprogram/pages/goodsList/goodsList.js
const app = getApp();
const quick = require('../../utils/quick.js');
const util = require('../../utils/util.js');
const business = require('../../utils/business.js');
const router = require('../../utils/router.js');
const { config } = require('../../config/config.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    layoutUuid: '',
    series: [],
    config,
    storeNum: 0,
    minaConfig: {},

    phone: '',
    isChecked: false,
    isDbSave: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.layoutUuid = options.layoutUuid;
    this.getLayoutGoodsList();
    this.getMllStoreNum();
    this.setMinaConfig();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    business.addShare(app.globalData.openId)
    return business.setMinaShareConfig(app)
  },
  // 获取设计
  getLayoutGoodsList() {
    quick.requestGet({ url: 'getLayoutGoodsList'}, {
      layoutUuid: this.data.layoutUuid
    }).then(res => {
      let {code, data} = res.data;
      if(code === 0 && data && data.length > 0) {
        data.forEach(list => {
          list.resStyleConfigVoList.map(item =>{
            item.shopPrice = item.shopPrice *100
            item.marketPrice = item.marketPrice * 100
          })
          list.resStyleConfigVoList = util.handleDataByArray(list.resStyleConfigVoList, {
            marketPrice: 'price',
            shopPrice: 'price'
          })
        })

        this.setData({
          series: data
        })
      }
    })
  },

  // 获取门店数量
  getMllStoreNum() {
    quick.requestGet({ url: 'getMllStoreNum' }, {})
      .then( res => {
        let { code, data } = res.data;
        if(code === 0) {
          this.setData({
            storeNum: data.storeNum
          })
        }
      })
  },

  makePhoneCall() {
    wx.makePhoneCall({
      phoneNumber: config.tel
    })
  },

  // 输入值
  inputValue(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [field]: e.detail.value
    })
  },
  checkPhone() {
    if (!(/^1[34578]\d{9}$/.test(this.data.phone))) {
      this.data.isChecked = false;
      quick.showToastNone('请输入正确的手机号')
      return ;
    }
    
    this.data.isChecked = true;
  },

  //保存用户信息
  saveUserInfo() {
    this.checkPhone();
    business.getUserInfo(app).then(res => {
      if (res != 1) {
        this.toggleModalTips()
      } else {

        const { openId } = app.globalData
        const { phone, sex } = this.data
        let formData = {
          openId: openId,
          phone: phone,
          sex: sex,
          collectionType: 103, // 102：申请设计， 103：预约顾问
        }
        let { isChecked, isDbSave } = this.data
        if (isChecked && !isDbSave) {
          this.data.isDbSave = true;
          quick.requestPost({ url: 'saveUserInfo' }, formData).then((res) => {
            const { code, data } = res.data;
            if (code === 0) {
              quick.showToastNone('恭喜您预约成功，请注意查收短信哦')
            } else {
              quick.showToastNone(
                code === 2
                  ? '感谢预约，稍后将有专属客服为您服务'
                  : '数据库开小差啦，请再来申请一次吧'
              )
            }
            this.data.isDbSave = false;
          })
        }
      }
    })

    
  },

  goWebView(e) {
    const { url } = e.currentTarget.dataset;
    if(!url) return;
    wx.navigateTo({
      url: `/pages/webview/webview?url=${url}`,
    })
  },

  // 跳转到mll商城商品详情页
  goMinaGoods(e) {
    const { sn } = e.currentTarget.dataset;
    router.goOtherMini(`/pages/goods/goods?goods_id=${sn}`, 'mllShop');
  },

  // 跳转到mll商城商品列表页
  goMinaGoodsSearch(e) {
    const { url } = e.currentTarget.dataset;
    if (/list\-.+/.test(url)) {
      router.goOtherMini(`/pages/search/search?keywords=&filterUrl=${url}`, 'mllShop');
    } else {
      router.goOtherMini(`/pages/search/search?keywords=${url}`, 'mllShop');
    }
  },

  setMinaConfig() {
    if (app.globalData.minaConfig) {
      this.setData({
        minaConfig: app.globalData.minaConfig
      })
      return;
    }
    setTimeout(() => {
      this.setMinaConfig();
    }, 100)
  },

  toggleModalTips() {
    this.setData({
      isShowModalTips: !this.data.isShowModalTips
    })
  },
})