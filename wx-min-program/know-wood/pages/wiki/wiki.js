// pages/wiki/wiki.js
const quick = require('../../utils/quick.js');
const util = require('../../utils/util.js');
const {router} = require('../../utils/router.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    wikiId: '',
    wikiDetail: '',
    relatedWoodList: {},  //相关木材
    refreshPage: 1,
    totalPages: 1, //换一换总页数
    bannerConfig: {
      index: 0
    },
  },

  //swiper改变事件
  swiperChange(event) {
    this.setData({
      'bannerConfig.index.': event.detail.current,
    })
  },

  //获取百科详情
  searchWikiDetail(){
    let formData = {
      wikiId: this.data.wikiId
    }
    quick.requestGet({ url: 'searchWikiDetail' }, formData).then((res) => {
      const { code, data } = res.data;
      if (code === 0) {
        this.setData({
          woodDetail: data
        })
        util.setNavigationBarTitle(data.woodInfo.woods_name)
      }
    })
  },

  // handleShowData(data){
  //   let jibenxinxiListKey = this.data.jibenxinxiListKey
  //   let arr=[]
  //   for (var i = 0; i < data.attr_group_list.length; i++){
  //     if (jibenxinxiListKey.indexOf(data.attr_group_list[i].attr_group_pinyin)!==-1){
  //       arr.push(data.attr_group_list[i])
  //     }
  //   }
  //   data.attr_group_list = arr
  // },

  //换一批木材数据
  searchWoodByWikiId(){
    if (this.data.refreshPage > this.data.totalPages ){
      this.data.refreshPage = 1
    }
    let formData = {
      wikiId: this.data.wikiId,
      page: this.data.refreshPage++
    }
    quick.requestGet({ url: 'searchWoodByWikiId' }, formData).then((res) => {
      const { code, data } = res.data;
      if (code === 0) {
        this.setData({
          totalPages: data.totalPages,
          relatedWoodList: data.woodList
        })
      }
    })
  },

  //查看相关木材的详情
  goToRelatedWood(event){
    let woodId = event.currentTarget.dataset.woodid
    wx.navigateTo({
      url: router('wiki', [`woodId=${woodId}`]),
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      wikiId: options.woodId
    })
    this.searchWoodByWikiId()
    this.searchWikiDetail()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },


  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})