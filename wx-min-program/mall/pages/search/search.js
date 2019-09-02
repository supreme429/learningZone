/*==================================================
 * project: meilele mall min-program 
 * author: leihao
 * createTime: 2018/08/27
 * file: search.js
 * description: 搜索脚本文件
 ==================================================*/


// 获取全局变量
const $ = global;
const app = getApp();
const requestPrefix = app.globalData.domain + '/search';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 默认搜索页面
    flag_defaultSearchPage: false, 

    // 搜索结果页面, 同时控制到首页的快捷图标
    flag_searchResultPage: true,   

    // 页面搜索关键字, 默认为空
    searchKeyWords: '',   

    // 是否显示搜索框中的背景图标，默认显示，键盘响应时清除
    flag_searchIcon: true, 

    // 搜索框中的清除按钮
    flag_clearInput: true,     

    // 搜索按钮, 展示搜索列表时，隐藏按钮
    flag_searchBtn: false, 

    // 默认搜索 - 面板一(历史搜索、热门搜索)
    flag_defaultSearchPanel: false, 
    // 默认搜索 - 面板二(搜索建议)
    flag_searchSuggestPanel: true, 

    // 历史搜索记录
    data_historySearch: null, 

    // 热门搜索数据
    data_hotSearch: null, 
    
    // 搜索建议数据
    data_searchSuggest: null, 

    // 搜索结果数据
    data_searchResult: [], 
    search_status:false,
    // 综合排序
    flag_toggleSortPanel: true, 
    // 排序数据 综合、新品、人气
    data_allSort: null, 
    // 默认排序方式
    currentSortText: '综合', 
    // 当前排序索引
    sort_order: 0, 

    saleUrl: '', // 按照销量排序
    priceUrl: '', // 按照价格排序的请求地址

    // 综合排序标记
    flag_defaultSort: 'down light',

    // 销量排序标记
    flag_saleSort: '',

    // 价格排序标记
    flag_priceSort: '',

    // 当前排序方式
    currentSortItem: '',
    // 当前排序的升降情况
    currentSortOrder: '',

    totalPage: 0, // 总页数
    nextPageUrl: '', // 下一页地址
    currentPage: 1, // 分页计数器

    // 回到底部显示控制
    flag_backtotop: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 判断是否是从分类页面跳转过来的
    if (options.keywords) {
      let keywords = options.keywords;
      this.setData({
        flag_defaultSearchPage: true, // 默认搜索页面
        flag_searchResultPage: false, // 搜索结果页面  
        searchKeyWords: keywords,
        flag_clearInput: true,
        flag_searchBtn: true,
        flag_searchIcon: false      
      });

      if (options.filterUrl) {
        // 筛选返回的地址
        let url = options.filterUrl + '?keywords=' + keywords;
        //let url = options.filterUrl
        this._getSearchResultByKeyWords(url, '', true);
      } else {
        // 普通关键字搜索
        this._getSearchResultByKeyWords(keywords);
      }
    } else if (options.filterUrl) {

      this._getSearchResultByKeyWords(options.filterUrl, '', true);

    } else {
      this._updateHistorySearchData();

      this._getHotSearchData();
    }
  },

  /**
   * 格式化历史搜索数据
  */
  _formartSearchHistroyData: function (callback) {
    wx.getStorage({
      key: 'searchRecord',
      success: function (res) {
        if (res && res.data) {
          // 去重
          var data = res.data, arrTpl = [], hashObj = {};

          data.forEach(function (item) {
            if (!hashObj[item]) {
              arrTpl.push(item);
              hashObj[item] = true;
            }
          });

          callback(arrTpl);
        } else {
          callback([]);
        }
      },
      fail: function () {
        callback([]);
      }
    })
  },

  /**
   * 更新历史搜索数据
  */
  _updateHistorySearchData: function() {
    var _this = this;
    this._formartSearchHistroyData(function (records) {
      if (records.length > 0) {
        records = records.reverse()
        _this.setData({
          data_historySearch: records
        });
      }
    });
  },

  /**
   * 清空搜索输入框
  */
  clearInputValue: function () {
    this.setData({
      flag_searchIcon: true,
      searchKeyWords: '',
      flag_clearInput: true,
      flag_defaultSearchPanel: false,
      flag_searchSuggestPanel: true,
      data_searchSuggest: null,

      flag_defaultSearchPage: false,
      flag_searchResultPage: true,
      data_searchResult: []
    });

    this._updateHistorySearchData();
    this._getHotSearchData();
  },

  /**
   * 点击搜索按钮，获取搜索结果
  */
  bindSearchBtnEvent: function () {
    var
      _this = this,
      name = this.data.searchKeyWords;

    this.setData({
      flag_clearInput: true
    });

    if (name && name.length > 0) {
      this.setData({
        flag_searchBtn: true
      });

      this._formartSearchHistroyData(function (records) {
        records.push(name);

        wx.setStorage({
          key: 'searchRecord',
          data: records
        });
      });

      this._getSearchResultByKeyWords(name);
    }

  },

  /**
   * 清空历史搜索记录
  */
  clearSearchHistory: function (e) {
    let _this = this;

    wx.showModal({
      title: '您确定要删除历史搜索数据？',
      content: '',
      confirmText: '确定',
      cancelText: '取消',
      success: function (data) {
        if (data.confirm) {
          wx.setStorage({
            key: 'searchRecord',
            data: [], 
          });
          _this.setData({
            data_historySearch: null
          });
        }
      }
    });
  },

  /**
   * 搜索联想
   * 输入关键字时，显示清空输入框按钮
  */
  changeInput: function (e) {
    var
      _this = this,
      keywords = e.detail.value;

    _this.setData({
      flag_defaultSearchPanel: true,
      flag_searchSuggestPanel: false
    });

    if (keywords.length > 0) {
      $.ajax({
        url: app.globalData.Login_url +'suggestion/?q=' + keywords,
        dataType: 'json',
        method: 'GET',
        success: function (res) {
          if (res && res.data) {
            let resCat = res.data.catogyList || []; // 分类中的结果 kw=
            let resKey = res.data.keywordList || []; // 正常结果 keywords=
            
            let tpl = [];

            resCat.push(...resKey);

            resCat.forEach(function(item){
              item.url = decodeURIComponent(item.url);
              item.keywords = item.name;
              if (item.isCategory) {
                let match = item.url.match(/kw=(.*)/);
                if (match && match[1]) {
                  item.keywords = match[1];
                }
              }
              
              tpl.push(item);
            });

            _this.setData({
              flag_defaultSearchPanel: true,
              flag_searchSuggestPanel: false,
              data_searchSuggest: tpl
            });
          }
        }
      });
    } else {
      this.setData({
        flag_defaultSearchPanel: false,
        flag_searchSuggestPanel: true,
        data_searchSuggest: null
      });
    }

    this.setData({
      flag_searchIcon: false,
      flag_clearInput: false,
      searchKeyWords: keywords
    });

  },

  /**
   * 输入框聚焦事件
  */
  inputFoucsEvent: function (e) {
    let _this = this;
    let val = e.detail.value;

    this.setData({
      flag_searchBtn: false,
      flag_defaultSearchPage: false,
      flag_searchResultPage: true
    });

    // 如果输入框中有关键字，则请求关键字联想
    if (val.length > 0) {
      this.changeInput(e);
    }
  },

  /**
   * 获取热门搜索数据
  */
  _getHotSearchData: function () {
    var _this = this;
    $.ajax({
      url: app.globalData.Login_url+'solr_api/hotSearchWord/',
      dataType: 'json',
      method: 'GET',
      success: function (res) {
        if (res && res.data) {
          let hotSearchData = res.data.hotSearchWordList;
          let tplArr = [];
          hotSearchData.forEach(function(item){
            if (item.url.match(/(keywords|category)/)) {
              tplArr.push(item.name);
            }
          });

          _this.setData({
            data_hotSearch: tplArr
          });
        }
      }
    });
  },

  /**
   * 根据url获取页面数据
  */
  _getSearchResultByKeyWords: function (keywords, callback, isUrl) {
    if (!keywords) {
      return;
    }

    var _this = this;

    this.setData({
      flag_defaultSearchPage: true,
      flag_searchResultPage: false,
      search_status:false
    });

    wx.showLoading({
      title: '努力加载中...',
    });

    let requestUrl = requestPrefix + '/?keywords=' + keywords + '&iVersion=1.0';
    if (isUrl) {
      // 此时关键词是一个url，主要针对排序
      requestUrl = requestPrefix + keywords;
    }

    $.ajax({
      url: requestUrl,
      dataType: 'json',
      data: {iVersion: '1.0'},
      method: 'GET',
      success: function (res) {
        wx.hideLoading();

        if (res && res.data) {
          let result = res.data.data;
          let list = result.goods;
          if (list){
            list.forEach((item) => {
              item.showTitle = (item.brand ?  item.brand : '') + ' ' + (item.style ? item.style : '') + ' ' + item.title;
            });
          }

          // 分页数据需要添加到前面的数组中去
          if (_this.data.currentPage > 1) {
            _this.data.data_searchResult.push(...list);
            _this.setData({
              data_searchResult: _this.data.data_searchResult,
              currentPage: result.pager.current_page,
              nextPageUrl: result.pager.next_page
            });
          } else {
            // 下拉菜单里面的排序数据
            let sortData = [
              { 'name': '综合', 'url': result.defaultSort },
              { 'name': '新品', 'url': result.order_add_time_url },
              { 'name': '人气', 'url': result.order_click_count_url }
            ];

            _this.setData({
              data_searchResult: list,
              search_status:true,
              currentPage: result.pager.current_page,
              nextPageUrl: result.pager.next_page,
              data_allSort: sortData,
              priceUrl: result.order_effect_price_url,
              saleUrl: result.sort == 'total_sold_yes_count' ? '' : result.order_total_sold_yes_count_url,
              totalPage: result.pager.total_page,
              currentSortItem: result.sort ? result.sort : '',
              currentSortOrder: result.order ? result.order : ''
            });
          }

          typeof callback === 'function' && callback(res);
        }
      }
    });
  },

  /**
   * 根据搜索的关键字获取页面数据
  */
  bindKeyWordsEvent: function (event) {
    let _this = this;
    let keywords = event.currentTarget.dataset.keywords;

    this.setData({
      searchKeyWords: keywords,
      flag_searchIcon: false,
      flag_searchBtn: true
    });

    this._formartSearchHistroyData(function (records) {
      records.push(keywords);

      wx.setStorage({
        key: 'searchRecord',
        data: records
      });
    });

    this._getSearchResultByKeyWords(keywords, function () {
      // 不处理
    });
  },

  /**
   * 排序事件
   * 综合、人气、新品
   * 销量
   * 价格
   * 都可以统一调用一个方法
   * 处理方法都是获取url地址，然后发请求获取符合条件的产品列表
  */
  _bindSortEvent: function(e, callback) {
    let url = e.currentTarget.dataset.url;

    if (url.length <= 0) {
      return;
    }

    this.setData({
      currentPage: 1,
      data_searchResult: []
    });

    this._getSearchResultByKeyWords(url, callback, true);
  },

  /**
   * 综合排序下拉列表中的单项事件
  */
  bindDropdownOptionEvent: function (e) {
    let order = e.currentTarget.dataset.sort_order;
    let name = e.currentTarget.dataset.name;

    this.setData({
      sort_order: order,
      currentSortText: name
    });

    this.bindToggleSortPanel();

    this._bindSortEvent(e);
  },

  /**
   * 切换排序面板
  */
  bindToggleSortPanel: function () {
    let isOpen = this.data.flag_toggleSortPanel;

    if (isOpen) {
      this.data.flag_toggleSortPanel = false;
      this.data.flag_defaultSort = 'up light';
    } else {
      this.data.flag_toggleSortPanel = true;
      this.data.flag_defaultSort = 'down light';
    }
    this.setData({
      flag_toggleSortPanel: this.data.flag_toggleSortPanel,
      flag_defaultSort: this.data.flag_defaultSort,
      flag_saleSort: '',
      flag_priceSort: '',
      search_status:false
    });
  },

  /**
   * 销量排序
  */
  bindSaleSortEvent: function(e) {
    let _this = this;

    this._bindSortEvent(e, function(){
      if (_this.data.currentSortItem == 'total_sold_yes_count') {
        _this.data.flag_saleSort = 'light';        
      } else {
        _this.data.flag_saleSort = ''; 
      }
      _this.setData({
        flag_defaultSort: 'down',
        currentSortText: '综合',
        flag_saleSort: _this.data.flag_saleSort,
        flag_priceSort: ''
      });
    });
  },
  
  /**
   * 价格排序事件
  */
  bindPriceSortEvent: function(e) {
    let _this = this;

    this._bindSortEvent(e, function(){
      if (_this.data.currentSortItem == 'effect_price') {
        if (_this.data.currentSortOrder == 'asc') {
          _this.data.flag_priceSort = 'up';
        } else {
          _this.data.flag_priceSort = 'down';
        }
      } else {
        _this.data.flag_priceSort = '';
      }
      _this.setData({
        flag_defaultSort: 'down',
        currentSortText: '综合',
        flag_saleSort: '',
        flag_priceSort: _this.data.flag_priceSort
      });
    });
  },

  /**
   * 跳转到筛选页面
  */
  redirectToFilterPage: function () {
    wx.navigateTo({
      url: '/pages/search-filter/search-filter?&keywords=' + this.data.searchKeyWords,
    })
  },

  /**
   * 跳转到首页
  */
  bindJumpToHome: function() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  /**
   * 回到顶部
  */
  bindBackToTop: function() {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300,
    })
    this.setData({
      flag_backtotop:true
    })
  },
  onPageScroll: function (e) {//页面滚动事件
    if (e.scrollTop > 1000) {
      this.setData({
        flag_backtotop: false
      })
    } else {
      this.setData({
        flag_backtotop: true
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 调用跟踪代码
    $.track.push(['trackView']);
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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // wx.showLoading({
    //   title: '正在努力加载...'
    // });

    if (this.data.currentPage < this.data.totalPage) {
      this.data.currentPage++;
      this.setData({
        currentPage: this.data.currentPage
      });
      
      let url = this.data.nextPageUrl;
      let match = url.match(/\/list-(.*)\//);
      if (match && match[0]) {
        url = match[0] + '?keywords='+ this.data.searchKeyWords;
      }

      this._getSearchResultByKeyWords(url, function () {
        setTimeout(function () {
          wx.hideLoading();
        }, 1000);
      }, true);
    }

    // 如果超过1屏，则显示返回顶部
    // if (this.data.currentPage > 1) {
    //   this.setData({
    //     flag_backtotop: false
    //   });
    // }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    return {
      title: '装修买家具 就上美乐乐',
      path: '/pages/category/category',
      success: function (res) {
        console.log(res)
        // 转发成功
      }
    }
  }
})

