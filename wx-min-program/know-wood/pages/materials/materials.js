// pages/materials/materials.js
const quick = require('../../utils/quick.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    editorRecId: '',
    editorRecIdType: '',
    editorRecIdLevel: '',
    list: [],
    page: 0,
    totalPages: null,
    totalElements: 0,
    searchData: {},
    loading: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    debugger
    this.setData({
      editorRecId: options.editorRecId,
      editorRecIdType: options.editorRecIdType,
      editorRecIdLevel: options.editorRecIdLevel,
    });
    this.setLevel(options.editorRecIdType, options.editorRecIdLevel);
    this.searchWoodWikiByClassifyTag();
  },

  searchWoodWikiByClassifyTag() {
    let { page, totalPages } = this.data;
    if (totalPages != null && page >= totalPages) {
      return;
    }
    this.setData({
      loading: true,
    })
    quick.requestGet({ url: 'searchWoodWikiByClassifyTag'}, Object.assign({
      idType: this.data.editorRecIdType,
      page: this.data.page,
    }, this.data.searchData)).then( res => {
      const { code, data } = res.data;
      if(code === 0 && data) {
        this.setData({
          list: this.data.list.concat(data.woodWikiList),
          totalPages: data.totalPages,
          totalElements: data.totalElements,
          loading: false
        })
        this.data.page++;
      }
    })
  },

  setLevel(t, l) {
    let o = {};

    if(t === "c") {
      o[l == 2 ? 'secondId' : 'threeId'] = this.data.editorRecId;
    } else if(t === "a") {
      o['secondId'] = this.data.editorRecId;
    }

    this.data.searchData = o;
  },
})