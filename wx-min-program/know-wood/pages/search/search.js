// pages/search/search.js
const util = require('../../utils/util.js');
const quick = require('../../utils/quick.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    labelId: '',
    labelName: '',
    keyword: '',
    keywords: [],
    searchWord: '',
    historyRecords: [],
    woodWikiList: [],
    articleList: [],
    showNoContent: false, //是否显示空内容
    searchNum: 0,  //搜索条数
    woodClassNum: '', //木材分类数目
    articleNum: 0,  //文章分类数目
    woodPage: 1,  //木材分类加载页数
    woodTotalPages: 2, //木材分类总页数
    articlePage: 1, //文章加载页数
    articleTotalPages: 2,  //文章总页数
    size: 10,
    searched: false,  //是否已经搜索
    currentTabType: 1,  //1:木材分类，2：文章分类
    srollViewHeight: '',
    loading: false,
  },

  handleRichText(data,word){
    let keyword = this.data.keyword
    for (let i = 0; i < data.woodWikiList.length; i++){
      data.woodWikiList[i].anotherName = data.woodWikiList[i].anotherName || '';
      data.woodWikiList[i].anotherName = `别称：${data.woodWikiList[i].anotherName.replace(new RegExp(word, 'g'), "<span class=\"colorRed\">" + word + "</span>")}`;
      data.woodWikiList[i].wikiTitle = `${data.woodWikiList[i].wikiTitle.replace(new RegExp(word, 'g'), "<span class=\"colorRed\">" + word + "</span>")}`;
      data.woodWikiList[i].editorEvaluate = `小编评价：${data.woodWikiList[i].editorEvaluate.replace(new RegExp(word, 'g'), "<span class=\"colorRed\">" + word + "</span>")}`;
    }
  },

  setKeyword(e){
    this.setData({
      keyword: e.detail.keyword
    })
  },

  //清除搜索关键字
  deleteKeyWord(){
    this.setData({
      keyword: '',
      searched: false,
      woodWikiList: [],
      articleList: []
    })
  },

  //搜索
  search(){
    this.changeHistoryRecord();
    this.setData({
      searched: true,
      currentTabType: 1,
      woodWikiList: [],
      articleList: []
    })
    this.setScrollViewHeight();
  
    this.data.woodPage = 1;
    this.data.woodTotalPages = 2
    this.searchWoodByKey()
  
    this.data.articlePage = 1
    this.data.articleTotalPages = 2
    this.searchArticleByKey()
    
  },

  //点击热门或历史记录快速搜索
  clickQuickSearch(event){
    let str = event.currentTarget.dataset.str;
    this.setData({
      keyword: str
    })
    this.search()
  },

  //改变历史搜索记录
  changeHistoryRecord(){
    let keyword = this.data.keyword
    let tempIndex = this.data.historyRecords.indexOf(keyword);
    if (tempIndex != -1){
      this.data.historyRecords.splice(tempIndex, 1);
    }
    this.data.historyRecords.unshift(keyword)
    this.setData({
      historyRecords: this.data.historyRecords
    })
    this.setHistoryRecord(this.data.historyRecords)
  },

  getHistoryRecord(){
    wx.getStorage({
      key: 'historyRecords',
      success: (data)=>{
        this.setData({
          historyRecords: data.data
        })
      },
      fail:()=>{
        this.setHistoryRecord([])
      }
    })
  },

  setHistoryRecord(data){
    wx.setStorage({
      key: 'historyRecords',
      data: data
    })
  },

  //清空历史记录
  removeHistoryRecord(){
    this.setHistoryRecord([]);
    this.setData({
      historyRecords: []
    })
    quick.showToastNone('已成功清除所有搜索记录');
  },

  //tab切换
  changeTabType(event){
    let type = event.currentTarget.dataset.type;
    this.setData({
      currentTabType: type
    })
    this.setNoContentShow(type)
  },

  setNoContentShow(currentTabType){
    if (currentTabType==1){
      if (this.data.woodWikiList.length<1){
        this.setData({
          showNoContent: true
        })
      }else{
        this.setData({
          showNoContent: false
        })
      }
    }else{
      if (this.data.articleList.length < 1) {
        this.setData({
          showNoContent: true
        })
      }else{
        this.setData({
          showNoContent: false
        })
      }
    }
  },

  setScrollViewHeight(){
    Promise.all([util.getSystemInfoAsync(), util.getDomInfoById('#resultList')]).then((rects)=>{
      console.log(rects[1].top)
      this.setData({
        srollViewHeight: rects[0].windowHeight - rects[1].top
      })
    })
  },

  //热搜关键字
  searchHotKey(){
    quick.requestGet({ url: 'searchHotKey' }).then((res) => {
      const { code, data } = res.data;
      if (code === 0) {
        this.setData({
          keywords: data.keywords,
          searchWord: `输入"${data.searchWord}"试试`
        })
      }
    })
  },

  //关键字搜索木材分类
  searchWoodByKey(){
    let { keyword, size, woodTotalPages } = this.data;
    let formData = {
      keyword:encodeURIComponent(keyword),
      page: this.data.woodPage++,
      size: size
    }
    if (this.data.woodPage > woodTotalPages+1) return;
    this.setData({
      loading: true
    })
    quick.requestGet({ url: 'searchWoodByKey' }, formData).then((res) => {
      const { code, data } = res.data;
      if (code === 0) {
        this.handleRichText(data, this.data.keyword);
        this.setData({
          woodClassNum: data.totalElements||0,
          woodTotalPages: data.totalPages||1,
          woodWikiList: this.data.woodWikiList.concat(data.woodWikiList),
          loading: false,
        })
        this.setNoContentShow(this.data.currentTabType)
      }
    })
  },

  //关键字搜索文章
  searchArticleByKey(){
    let { keyword, size, articleTotalPages} = this.data
    let formData = {
      keyword: encodeURIComponent(keyword),
      page: this.data.articlePage++,
      size: size
    }
    if (this.data.articlePage > articleTotalPages+1) return;
    this.setData({
      loading: true
    })
    quick.requestGet({ url: 'searchArticleByKey' }, formData).then((res)=>{
      let { code, data } = res.data;
      if (code === 0) {
        if(data === null){
          data = {
            totalElements: 0,
            totalPages: 1,
            articleList: [],
          }
        }
        this.setData({
          articleNum: data.totalElements,
          articleTotalPages: data.totalPages,
          articleList: this.data.articleList.concat(data.articleList),
          loading: false
        })
      }
    })
  },

  //标签搜索木材分类接口
  searchWoodByTag(){
    let { labelId, size, woodTotalPages } = this.data
    let formData = {
      labelId: labelId,
      page: this.data.woodPage++,
      size: size
    }
    if (this.data.woodPage > woodTotalPages+1) return;

    quick.requestGet({ url: 'searchWoodByTag' }, formData).then((res) => {
      const { code, data } = res.data;
      if (code === 0) {
        this.handleRichText(data, this.data.labelName);
        this.setData({
          woodClassNum: data.totalElements,
          woodTotalPages: data.totalPages,
          woodWikiList: this.data.woodWikiList.concat(data.woodWikiList||[])
        })
      }
    })
  },

//标签搜索文章接口
  searchArticleByTag() {
    let { labelId, size, articleTotalPages } = this.data
    let formData = {
      labelId: labelId,
      page: this.data.articlePage++,
      size: size
    }
    if (this.data.articlePage > articleTotalPages+1) return;

    quick.requestGet({ url: 'searchArticleByTag' }, formData).then((res) => {
      const { code, data } = res.data;
      if (code === 0) {
        this.setData({
          articleNum: data.totalElements,
          articleTotalPages: data.totalPages,
          articleList: this.data.articleList.concat(data.articleList||[])
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.searchHotKey()
    if(options.keyword) {
      this.setData({
        keyword: options.keyword
      })
      this.search();
    }
    if (options.labelId){
      let { labelId, labelName } = options
      this.setData({
        labelId: labelId,
        labelName: labelName,
        searched: true
      })
      //设置页面标题名
      util.setNavigationBarTitle(labelName)
      this.searchWoodByTag();
      this.searchArticleByTag();
      this.setScrollViewHeight();
    }
    this.getHistoryRecord()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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