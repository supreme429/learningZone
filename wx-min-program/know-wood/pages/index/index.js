//index.js
//获取应用实例
const app = getApp()
const { router } = require('../../utils/router.js');
const quick = require('../../utils/quick.js');
const util = require('../../utils/util.js');

Page({
  data: {
    isShowFocusPlus: false, // 是否展示公众号关注组件
    searchWord: '',
    hotData: [],

    wikiList:[],
    filterResultTxt: '',
    firstId: '',
    secondId: '',
    threeId: '',
    idType: '',
    wikiPage: 0,
    wikiSize: 10,
    wikiTotalPages: 1,
    filterListHeight: 'auto',
    scrollHeight: 0,
    scrollTop: 0,
    returnTopShow: false,
    showView: false,
  },
  
  onLoad: function () {
    this.searchWoodWikiByClassifyTag();
    quick.requestAll([this.getSearchWord(), this.getSearchHotData()], () => {
      this.setData({
        isShowFocusPlus: app.globalData.appId === 'wx7349fd4eafd7e81e',
        showView: true,
      })
    })
  },

  setScrollHeight(callback){
    util.getSystemInfoAsync().then((res)=>{
      this.setData({
        scrollHeight: res.windowHeight
      }, callback)
    })
  },

  goPageSearch(e) {
    wx.navigateTo({
      url: router('search'),
    })
  },

  // 获取热门关注数据
  getSearchHotData() {
    return quick.requestGet({ url: 'searchHotData'})
      .then(res => {
        const { code, data } = res.data;
        if(code === 0) {
          this.setData({
            hotData: data.hotMaterial || []
          })
        }
      })
  },

  //确定筛选
  saveFilter(options){
    let { firstId, firstName, secondId, secondName, threeId, threeName, idType } = options.detail
    if (this.data.firstId == firstId && this.data.secondId == secondId && this.data.threeId == threeId) return;
    this.setData({
      filterResultTxt: threeName ? `${firstName}/${secondName}/${threeName}` : (secondName ? `${firstName}/${secondName}` : `${firstName}`),
      firstId: firstId,
      secondId: secondId,
      threeId: threeId,
      idType: idType,
      wikiPage: 0,
      wikiTotalPages: 1,
    })
    this.searchWoodWikiByClassifyTag('filter');
  },

  //根据分类标签查询木材百科数据接口
  searchWoodWikiByClassifyTag(type){
    let { firstId, secondId, threeId, idType, wikiPage, wikiSize } = this.data
    let formData = {
      firstId: firstId,
      secondId: secondId,
      threeId: threeId,
      idType: idType,
      page: this.data.wikiPage++,
      wikiSize
    }
    if (this.data.wikiPage > this.data.wikiTotalPages) return;
    return quick.requestGet({ url: 'searchWoodWikiByClassifyTag' }, formData).then((res) => {
      let { code, data } = res.data;
      if (code === 0) {
        if(data === null){
          data = {
            woodWikiList: [],
            totalPages: 1,
            totalElements: 0,
          }
        }
        if (type =='filter'){
          this.setData({
            wikiList: data.woodWikiList,
          },()=>{
            this.setData({
              filterListHeight: 'auto',
            })
          })
        }else{
          this.setData({
            wikiList: this.data.wikiList.concat(data.woodWikiList),
          })
        }
        this.setData({
          wikiPage: this.data.wikiPage,
          wikiTotalPages: data.totalPages,
          wikiTotalElements: data.totalElements
        })
      }
    })
  },

  //重置筛选
  resetFilter(){
    this.selectComponent("#cascadeScreening").reset();
    this.setData({
      filterResultTxt: '',
      firstId: '',
      secondId: '',
      threeId: '',
      idType: '',
      wikiList: [],
      wikiPage: 0,
      wikiTotalPages: 1,
    })
    this.searchWoodWikiByClassifyTag();
  },

  setFilterListHeight(options){
    util.getDomInfoById("#filter-list").then((rect)=>{
      console.log(rect)
      this.setData({
        filterListHeight: rect.height < (options.detail.height + 33) ? `${(options.detail.height + 33)}px`: 'auto'
      })
    })
  },
  closeModalFilter() {
    if (options.detail.type == 'filter') return;
    this.setData({
      filterListHeight: 'auto'
    })
  },

  getSearchWord(i = 0) {
    if (i > 5) return;
    if (app.globalData.searchWord) {
      this.setData({
        searchWord: app.globalData.searchWord
      })
      return;
    }
    setTimeout(() => {
      this.getSearchWord(i++);
    }, 500)
  },

  scrollEv(e) {
    const { scrollTop } = e.detail;
    if (scrollTop > 600 && !this.data.returnTopShow) {
      this.setData({
        returnTopShow: true
      })
    } else if (scrollTop < 600 && this.data.returnTopShow) {
      this.setData({
        returnTopShow: false
      })
    }
  },

  returnTop() {
    this.setData({
      scrollTop: 0
    })
  }
})
