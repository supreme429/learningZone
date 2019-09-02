/*==================================================
 * project: meilele mall min-program 
 * author: leihao
 * createTime: 2018/08/27
 * file: search-filter.js
 * description: 搜索-筛选脚本文件
 ==================================================*/

// 获取全局变量
const $ = global;
const app = getApp();
const requestPrefix = app.globalData.domain + '/search/';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 记录第一次获取到的数据，重置的时候直接将该数据赋值给data_filter,
    data_origin: [],

    // 筛选数据
    data_filter: [],

    // 是否选中标记
    flag_selected: '',

    // 搜素关键字
    keywords: '',

    // 将同一类别的选择项合并
    mergeConfig: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let keywords = options.keywords;

    //if (keywords) {
      this.setData({
        keywords: keywords
      });
      this._getFilterData(keywords);
    //}
  },

  /**
   * 获取筛选项
  */
  _getFilterData: function (keywords) {
    let _this = this;

    let requestUrl = requestPrefix + '?keywords=' + keywords + '&filter=1&iVersion=1.0';
    if (!keywords) {
      requestUrl = requestPrefix + 'category-9999/?filter=1 & iVersion=1.0';
    }

    $.ajax({
      url: requestUrl,
      dataType: 'json',
      method: 'GET',
      success: function (res) {
        if (res && res.data) {
          let filterData = res.data.data.filter_map; 
          _this.setData({
            data_origin: _this._formartData(filterData),
            data_filter: _this._formartData(filterData)
          });

          _this._setMergeMode(filterData);
        }
      }
    });

  },

  /**
   * 格式化请求返回的数据
  */
  _formartData: function(originData) {
    if (!originData || originData.length <= 0) {
      return originData;
    }

    originData.forEach(function(cat, catIndex){
      let coreList = cat.list;

      // 设置选中项
      cat.selected_arr = [];
      cat.selected_str = '';

      coreList.forEach(function(opt, optIndex){
        if (optIndex > 5) {
          opt.is_hidden = true;
        }

        // 将第6个项的文字替换为...
        if (coreList.length > 6) {
          opt.replaceName = (optIndex == 5) ? '...' : opt.name;
        } else {
          opt.replaceName = opt.name;
        }
      });
    });

    return originData;
  },

  /**
   * 设置合并模式
  */
  _setMergeMode: function (originData) {
    originData.forEach((item)=>{
      if (item.base_more_chose_url) {
        let key = item.name;
        let val = item.base_more_chose_url;
        this.data.mergeConfig[key] = val;
      }
    });

    this.setData({
      mergeConfig: this.data.mergeConfig
    });
  },

  /**
   * 切换更多选项
  */
  bindToggleMoreOptions: function(e) {
    let order = e.currentTarget.dataset.cat_order;
    let isExpand = this.data.data_filter[order].is_expand;

    if (isExpand) {

      this.data.data_filter[order].is_expand = false;

      let data = this.data.data_filter[order].list;
      data.forEach(function (item, index) {
        if (index > 5) {
          item.is_hidden = true;
        }

        // 将第6个项的文字替换为...
        item.replaceName = (index == 5) ? '...' : item.name;
      });

    } else {

      this.data.data_filter[order].is_expand = true;

      let data = this.data.data_filter[order].list;
      data.forEach(function (item) {
        item.is_hidden = false;
        item.replaceName = item.name;
      });

    }

    this.setData({
      data_filter: this.data.data_filter
    });
  },

  /**
   * 选项选中事件
  */
  bindOptionSelected: function(e) {
    let dataset = e.currentTarget.dataset
    let catOrder = dataset.cat_order;
    let catName = dataset.cat_name;
    let optOrder = dataset.opt_order;

    let isSelected = this.data.data_filter[catOrder].list[optOrder].is_selected;
    
    if (this.data.data_filter[catOrder].base_more_chose_url) { //多选

      if (isSelected) {
        this.data.data_filter[catOrder].list[optOrder].is_selected = false;
        this.cancelOptionSelected(catOrder, this.data.data_filter[catOrder].list[optOrder].name);
      } else {
        this.data.data_filter[catOrder].list[optOrder].is_selected = true;
        this.data.data_filter[catOrder].selected_arr.push(this.data.data_filter[catOrder].list[optOrder].name);

        // 当选择项多于3个时，只去前面3个加上...
        if (this.data.data_filter[catOrder].selected_arr.length > 3) {
          let tplarr = this.data.data_filter[catOrder].selected_arr.slice(0, 3);
          this.data.data_filter[catOrder].selected_str = tplarr.join(',') + '...';
        } else {
          this.data.data_filter[catOrder].selected_str = this.data.data_filter[catOrder].selected_arr.join(',');
        }
      }

    } else { // 单选

      if (isSelected) {
        this.data.data_filter[catOrder].list[optOrder].is_selected = false;
        this.cancelOptionSelected(catOrder, this.data.data_filter[catOrder].list[optOrder].name);
      } else {
        this.data.data_filter[catOrder].list.forEach((subItem)=>{
          subItem.is_selected = false;
        });
        this.data.data_filter[catOrder].list[optOrder].is_selected = true;
        this.data.data_filter[catOrder].selected_arr[0] = this.data.data_filter[catOrder].list[optOrder].name;

        this.data.data_filter[catOrder].selected_str = this.data.data_filter[catOrder].selected_arr.join(',');
      }

    }    

    if (optOrder == 5) {
      this.bindToggleMoreOptions(e);
    }

    this.setData({
      data_filter: this.data.data_filter
    });
  },

  /**
   * 取消选项
  */
  cancelOptionSelected: function(catOrder, currentOption) {

    let data = this.data.data_filter[catOrder].selected_arr;

    let tplArr = [];

    data.forEach(function(item){
      if (item != currentOption) {
        tplArr.push(item);
      }
    });

    this.data.data_filter[catOrder].selected_arr = tplArr;

    // 当选择项多于3个时，只取前面3个加上...
    if (this.data.data_filter[catOrder].selected_arr.length > 3) {
      let tplarr = this.data.data_filter[catOrder].selected_arr.slice(0, 3);
      this.data.data_filter[catOrder].selected_str = tplarr.join(',') + '...';
    } else {
      this.data.data_filter[catOrder].selected_str = this.data.data_filter[catOrder].selected_arr.join(',');
    }

    this.setData({
      data_filter: this.data.data_filter
    });
  },

  /**
   * 重置
  */
  bindReset: function() {
    this.setData({
      data_filter: this.data.data_origin
    });
  },

  /**
   * 合并选项
  */
  _mergeOptionByCat: function (opts, mode) {
    let tmp = [];
    let url = '';

    opts.forEach((item)=>{
      let match = item.match(/(\d+)/i);
      if (match && match[0]) {
        tmp.push(match[0]);
      }      
    });

    url = mode.replace(/\{9999\}/, tmp.join('_'));
    return url;
  },

  /**
   * 确定
  */
  bindSure: function() {
    let regConfig = [
      {
        name: "优惠",
        reg: /\-a(\d+)/i
      },
      {
        name: "品牌",         
        reg: /\-b(\d+)((_(\d+))*)/i
      },
      {
        name: "风格",
        reg: /\-s(\d+)((_(\d+))*)/i
      },
      {
        name: "热点",
        reg: /\-y(\d+)/i
      },
      {
        name: "材质",
        reg: /\-m(\d+)((_(\d+))*)/i
      },
      {
        name: "自定义属性",
        reg: /\-(\d+)_(\d+)/i,
      },
      {
        name: "价格下限",
        reg: /\-n(\d+)/i
      },
      {
        name: "价格上限",
        reg: /\-x(\d+)/i
      },
      {
        name: "商品分类",
        reg: /\-f(\d+)((_(\d+))*)/i
      }
    ];

    let data = this.data.data_filter;
    let modeConfig = this.data.mergeConfig; 
    let selectedOptions = [];

    data.forEach((catItem)=>{
      let options = catItem.list; 
      if (modeConfig[catItem.name]) {
        let mergeOptions = [];
        options.forEach(function (optItem) {
          if (optItem.is_selected) {
            let url = optItem.url;
            mergeOptions.push(url);
          }
        });

        if (mergeOptions.length > 1) {
          selectedOptions.push(this._mergeOptionByCat(mergeOptions, modeConfig[catItem.name]));
        } else {
          selectedOptions = mergeOptions;
        }
      } else {        
        options.forEach(function (optItem) {
          if (optItem.is_selected) {
            let url = optItem.url;
            selectedOptions.push(url);
          }
        });
      }
    });    
    
    let urlOpts = [];
    regConfig.forEach(function (regItem){
      selectedOptions.forEach(function (optItem){
        var match = optItem.match(regItem.reg); 
        if (match && match[0]) {
          urlOpts.push(match[0]);
        }
      });
    });

    // 开始拼接筛选地址
    let url = '/list' + urlOpts.join('') + '/';

    wx.redirectTo({
      url: '/pages/search/search?keywords=' + this.data.keywords + '&filterUrl=' + url,
    });
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
    
  },

})