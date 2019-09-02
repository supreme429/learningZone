/*==================================================
 * project: meilele mall min-program 
 * author: leihao
 * createTime: 2018/08/31
 * file: goods.js
 * description: 产品详情coo
 * 
 * 
 * 
 * 页脚本文件
 ==================================================*/
const $ = global;
const app = getApp();
const requestPrefix = app.globalData.domain;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 记录用户浏览时长
    viewTime: '',

    //定位信息
    regionInfo: null,

    // 商品id
    goodsId: '20914',

    // 商品信息
    data_goodsInfo: null,

    // tab
    data_tabs: [
      { 'type': 'goods', 'name': '商品', 'top': 0 },
      { 'type': 'comment', 'name': '评价', 'top': 0 },
      { 'type': 'detail', 'name': '详情', 'top': 0 }
    ],
    tab_order: 0,
    flag_tabClickToScroll: '',
    data_pageScrollerHeight: 1500,

    // 商品相册
    data_gallery: null,
    // swiper 设置
    swipterCurrentIndex: 1,
    indicatorDots: false,
    autoplay: true,
    interval: 3000,
    duration: 500,
    circular: true,

    // 离你最近的体验馆
    data_nearestExprTips: '美乐乐全国300余家体验馆可查看实物',
    // 体验馆模块数据
    data_exprMod: null,

    // 评价数据
    data_goodsComment: null,

    // 商品详情tab
    data_goodsTab: [
      { 'name': '商品详情', 'type': 'pic' },
      { 'name': '规格参数', 'type': 'prop' }
    ],
    // 选中tab索引
    goodsTab_order: 0,
    // tab占位
    flag_goodsDetailTabHolder: true,
    // tab改变position到fixed
    flag_goodsDetailTabFixed: false,
    // 商品详情图层
    flag_goodsTab_pic: false,
    // 商品规格参数图层
    flag_goodsTab_prop: true,

    // 商品规格参数数据
    data_goodsProperty: null,

    // 商品购买数量，默认1
    data_shoppingNumber: 1,

    // 商品是否被收藏过
    flag_isCollected: false,

    // 商品收藏图标的状态
    image_collect_no: '../../statics/goods/collect.png',
    image_collect_ok: '../../statics/goods/collected.png',

    // 是否隐藏购买按钮
    flag_hiddenShoppingBtn: true,

    // 是否授权用户信息
    flag_isAuthorizeUserInfo: false,
    imagesUrl: app.globalData.imagesUrl,
    //回到顶部
    flag_backtotop: true, 
    //页面滚动距离
    scrollViewTop:'0'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;
    let goodsId = options.goods_id || '20914';
    if (goodsId) {
      this.setData({
        goodsId: goodsId
      });
    }

    this.data.viewTime = new Date().getTime();

    app.checkUserInfoAuthorize((isAuthorized)=>{
      this.setData({
        flag_isAuthorizeUserInfo: isAuthorized
      });
    });

    this._setPageScrollerHeight();

    this._getGoodsInfo(goodsId, function(){
      _this._getTopLabelItemTopValue();
    });

    this._getUserLocation(); 

    this._getGoodsCommentData(goodsId, function(){
      _this._getTopLabelItemTopValue();
    });

    // TODO 放到点击规格参数tab时请求
    this._getGoodsProperty(goodsId);

    // 检查商品收藏状态
    this._checkGoodsCollectStatus(goodsId);
  },
  /**
   * 获取设备屏幕的高度
   * 设置页面的scroll-view的高度
  */
  _setPageScrollerHeight: function() {
    let _this = this;
    let screenHeight = wx.getSystemInfoSync().windowHeight;
    let topBarheight = 0;
    let bottomBarHeight = 0;

    let query = wx.createSelectorQuery();
    query.select('#topTabBar').boundingClientRect();
    query.select('#bottomBar').boundingClientRect();
    query.exec(function(res){
      if (res) {
        topBarheight = res[0].height;
        bottomBarHeight = res[1].height;

        _this.data.data_pageScrollerHeight = screenHeight - topBarheight - bottomBarHeight;
        _this.setData({
          data_pageScrollerHeight: _this.data.data_pageScrollerHeight
        });
      }
    });    
  },
  /**
     * 跳转到首页
    */
  bindJumpToHome: function () {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },
  /**
   * 回到顶部
  */
  bindBackToTop: function () {
    this.setData({
      flag_backtotop: true,
      flag_tabClickToScroll:'goods',
      tab_order:'0',
      goodsTab_order:'0',
      flag_goodsTab_pic: false,
      flag_goodsTab_prop: true,
    })
  },
  /**
   * 获取商品信息
  */
  _getGoodsInfo: function(goodsId, callback) {
    if (!goodsId) {
      return;
    }

    let _this = this;

    $.ajax({
      url: requestPrefix + '/goods/goodsInfo/info/?goods_id=' + goodsId + '&iVersion=1.0',
      dataType: 'json',
      method: 'GET',
      success: function (res) {
        if (res && res.data) {
          let goodsInfo = res.data.data;

          // 相册
          let galleryCount = goodsInfo.gallery.length;
          _this.data.data_gallery = {
            count: galleryCount,
            list: goodsInfo.gallery
          };

          // 商品图片
          goodsInfo.goods_lighting_ad = goodsInfo.goods_lighting_ad.length > 0 ? goodsInfo.goods_lighting_ad : null;
          goodsInfo.goods_recomment = goodsInfo.goods_recomment.length > 0 ? goodsInfo.goods_recomment : null;
          goodsInfo.brand_ad = goodsInfo.brand_ad.length > 0 ? goodsInfo.brand_ad : null;
          goodsInfo.pictures = goodsInfo.pictures.length > 0 ? goodsInfo.pictures : null;

          // 是否显示购买按钮
          _this.data.flag_hiddenShoppingBtn = goodsInfo.is_can_buy == 0 ? true : false;
          console.log('goodsInfo', goodsInfo)
          _this.setData({
            data_goodsInfo: goodsInfo,
            data_gallery: _this.data.data_gallery,
            flag_hiddenShoppingBtn: _this.data.flag_hiddenShoppingBtn
          });

          typeof callback === 'function' && callback(res.data.data);
        }
      }
    });
  },

  /**
   * 计算tab中每个标签对应的元素的top值
   * 由于体验馆、评论的数据是异步加载，因此获取的值可能不准确
   * 两个异步请求成功后再调一次
  */
  _getTopLabelItemTopValue: function() {
    let lables = this.data.data_tabs;

    lables.forEach(function(item){
      let selector = '#'+item.type;
      wx.createSelectorQuery().select(selector).boundingClientRect(function(rect) {
        if (rect) {
          item.top = rect.top - 44; // 顶部有一个占位元素，需要除去高度
          item.height = rect.height;
        }
      }).exec();
    });

    this.setData({
      data_tabs: lables
    });
  },

  /**
   * tab切换
  */
  bindToggleModuleEvent: function(e) {
    let order = e.currentTarget.dataset.order;
    let label = e.currentTarget.dataset.type;

    let _this = this;

    let query = wx.createSelectorQuery();
    query.select('#pageScrollContainer').boundingClientRect(function(res){
      if (res) {
        _this.setData({
          data_pageScrollerHeight: res.height
        });
      }
    }).exec();

    this.setData({
      tab_order: order,
      flag_tabClickToScroll: label
    });    
  },

  /**
   * 获取swiper当前项
  */
  getSwiperIndex: function(e) {
    let index = e.detail.current;
    this.setData({
      swipterCurrentIndex: index + 1
    });
  },

  /**
   * 获取位置信息
  */
  _getUserLocation: function(callback) {
    let _this = this;

    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        let latitude = res.latitude;
        let longitude = res.longitude;
        console.log('定位', res)
        // 根据经纬度获取城市信息
        $.ajax({
          url: requestPrefix + '/goods/location/cityInfo/?latitude=' + latitude + '&longitude=' + longitude +'&iVersion=1.0',
          dataType: 'json',
          method: 'GET',
          success: function(res) {
            if (res && res.data) {
              let tplData = res.data.data;

              _this.data.data_exprMod = tplData.expr[0];

              // 产品相册下方的体验馆信息提示
              let belong = tplData.expr_belong;
              switch (belong) {
                case 'city':
                  _this.data.data_nearestExprTips = tplData.city_name + '市共有' + tplData.expr_num + '家体验馆可以看实物';
                  _this.data.data_exprMod.area = tplData.city_name + '市';
                  _this.data.data_exprMod.num = tplData.expr_num;
                  break;
                case 'provice':
                  _this.data.data_nearestExprTips = tplData.provice_name + '省共有' + tplData.expr_num + '家体验馆可以看实物';
                  _this.data.data_exprMod.area = tplData.provice_name + '省';
                  _this.data.data_exprMod.num = tplData.expr_num;
                  break;
                case 'no':
                  _this.data.data_nearestExprTips = '美乐乐全国' + tplData.all_expr_num +'余家体验馆可以查看实物';
                  _this.data.data_exprMod.area = '全国';
                  _this.data.data_exprMod.num = tplData.all_expr_num;
                  break;
              }

              // 体验馆模块
              _this.setData({
                data_nearestExprTips: _this.data.data_nearestExprTips,
                data_exprMod: _this.data.data_exprMod
              });

              // 将位置信息写入缓存
              let regionInfo = tplData;
              // 添加经纬度信息
              regionInfo.latitude = latitude;
              regionInfo.longitude = longitude;
              // 只缓存距离最近的体验馆
              regionInfo.expr = tplData.expr[0];
              if (wx.getStorageSync('phoneNumber')){
                regionInfo.phoneNumber = wx.getStorageSync('phoneNumber')
              }
              console.log('regionInfo',regionInfo)
              app.setRegionInfo(regionInfo);     
              _this.setData({
                regionInfo: regionInfo
              });  
              if (callback){
                callback()
              }       
            }
          }
        })
      }
    })
  },

  /**
   * 获取用户授权
  */
  _getUserInfoAuthorize: function(e, fn) {
    console.log('检查授权',e)
    if (this.data.flag_isAuthorizeUserInfo) {
      fn();
      this.data.flag_isAuthorizeUserInfo = true;
    } else {
      console.log(e.detail.encryptedData);
      if (e && e.detail && e.detail.encryptedData) {
        fn();
        this.data.flag_isAuthorizeUserInfo = true;
        app.globalData.encryptedData = e.detail.encryptedData;

        this.setData({
          flag_isAuthorizeUserInfo: this.data.flag_isAuthorizeUserInfo
        });
      }
    }
  },

  /**
   * 获取附近体验馆地址
   * 调用expr-address组件
  */
  bindGetCurrentExprAddressEvent: function(e) {
    let that = this;
    if (e.detail.errMsg == "getUserInfo:ok"){
      //登录
      let params = {
        'type': 2,
        'encryptedData': e.detail.encryptedData,
        'iv': e.detail.iv
      }
      $.util.userLogin(params)
    }
    app.checkLocationAuthorize((isAuth) => {
      if (isAuth) {
        let regionInfo = JSON.stringify(app.getRegionInfo());
        if (regionInfo != '{}') {
          that.exprAddress.toggleAddressPanel();
        }else{
          that._getUserLocation(function () {
            that.exprAddress.toggleAddressPanel();
          })
        }
        console.log('授权信息', regionInfo)
      }
    });  
    // this._getUserInfoAuthorize(e, () => {
    //   this.exprAddress.toggleAddressPanel();
    // });
  },
  //到店查看实物授权
  bindGetUserInfoEvent:function(e){
    if (e.detail.errMsg == "getUserInfo:ok") {
      //登录
      let params = {
        'type': 2,
        'encryptedData': e.detail.encryptedData,
        'iv': e.detail.iv
      }
      $.util.userLogin(params)
    }
  },
  /**
   * 降价通知
  */
  bindPriceRemindEvent: function (e) {
    if (e.detail.errMsg == "getUserInfo:ok") {
      //登录
      let params = {
        'type': 2,
        'encryptedData': e.detail.encryptedData,
        'iv': e.detail.iv
      }
      $.util.userLogin(params)
    }
    this._getUserInfoAuthorize(e, () => {
      this.priceRemainContainer.toggleRemindPanel();
    });
  },

  /**
   * 预约服务顾问
   * 调用组件service-counselor
  */
  bindOrderCounselorEvent: function(e) {
    let that = this
    // 调用组件之前先判断用户是否授权了地理位置
    // 如果没有授权则无法继续下一步
    /*this._getUserInfoAuthorize(e, () => {
      this.countselor.toggleDisplayStatus();
    })*/
    if (e.detail.errMsg == "getUserInfo:ok") {
      //登录
      let params = {
        'type': 2,
        'encryptedData': e.detail.encryptedData,
        'iv': e.detail.iv
      }
      $.util.userLogin(params)
    }
    app.checkLocationAuthorize((isAuth)=>{
      if (isAuth) {
        let regionInfo = JSON.stringify(app.getRegionInfo());
        if (regionInfo != '{}'){
          console.log('授权信息', regionInfo)
          that.countselor.toggleDisplayStatus();
        }else{
          that._getUserLocation(function () {
            that.countselor.toggleDisplayStatus();
          })
        }
        
        
      }
    });  
  },

  /**
   * 获取评论数据
  */
  _getGoodsCommentData: function(goodsId, callback) {
    if (!goodsId) {
      return;
    }

    let _this = this;

    $.ajax({
      url: $.config.REQUEST_URL+'mll_api/api/goods_comment?goods_id=' + goodsId +'&limit_start=0&limit_end=1',
      dataType: 'json',
      method: 'GET',
      success: function (res) {
        if (res && res.data) {
          let commentData = res.data;

          // 计算星星显示长度
          let level = parseInt(commentData.one_comment.h_score);
          commentData.one_comment.level_per = (level * 20) + '%';

          _this.setData({
            data_goodsComment: commentData
          });

          typeof callback === 'function' && callback(commentData);
        }
      }
    })
  },

  /**
   * 选择商品规格、材质...事件
   * 调用goods-property组件
  */
  bindSpecPanelEvent: function() {
    this.goodsPropery.toggleProperyPanel();
  },

  /**
   * 获取商品的购买数量
  */
  shoppingNumber: function(e) {
    this.setData({
      data_shoppingNumber: e.detail
    });
  },

  /**
   * 点击商品详情tab事件
  */
  bindGoodsTabClickEvent: function(e) {
    let order = e.currentTarget.dataset.goodstab_order;
    let flag = e.currentTarget.dataset.goodstab_type;

    if (flag == 'pic') {
      this.data.flag_goodsTab_pic = false;
      this.data.flag_goodsTab_prop = true;
    } else {
      this.data.flag_goodsTab_pic = true;
      this.data.flag_goodsTab_prop = false;
    }

    this.setData({
      goodsTab_order: order,
      flag_goodsTab_pic: this.data.flag_goodsTab_pic,
      flag_goodsTab_prop: this.data.flag_goodsTab_prop
    });
  },

  /**
   * 获取商品规格
  */
  _getGoodsProperty: function(goodsId) {
    if (!goodsId) {
      return;
    }

    let _this = this;

    $.ajax({
      url: $.config.REQUEST_URL +'/mll_api/api/goods_spec?goods_id=' + goodsId,
      dataType: 'json',
      method: 'GET',
      success: function (res) {
        if (res && res.data) {
          _this.setData({
            data_goodsProperty: res.data.properties
          });
        }
      }
    })
  },

  /**
   * 检查商品被收藏状态
  */
  _checkGoodsCollectStatus: function (goodsId, callback) {
    let _this = this;
    
    if (!goodsId) {
      return;
    }

    let userId = wx.getStorageSync('user_id') ? wx.getStorageSync('user_id') : '';

    // 判断商品是否已经被收藏
    $.ajax({
      url: $.config.REQUEST_URL +'mll_api/api/app_igcollect?gid=' + goodsId + '&user_id=' + userId,
      dataType: 'json',
      method: 'GET',
      success: function (res) {
        if (res && res.data) {
          let result = res.data;
          if (result.length > 0) {
            let result = res.data[0];

            if (result.is_collect == 1) { // 已收藏
              _this.data.flag_isCollected = true;
            } else { // 未收藏
              _this.data.flag_isCollected = false;
            }

            _this.setData({
              flag_isCollected: _this.data.flag_isCollected
            });

            typeof callback === 'function' && callback(result);
          }
        }
      }
    })
  },

  /**
   * 绑定收藏事件
  */
  bindGoodsCollectEvent: function() {
    let _this = this;
    let goodsId = this.data.goodsId;

    this._checkGoodsCollectStatus(goodsId, function(res){
      if (res.is_collect == 1) {
        let collectId = res.rec_id;
        _this._cancelGoodsCollect(collectId);
      } else {
        _this._addGoodsCollect(goodsId, function () {
          // 成功，并打开降价通知订阅界面
          _this.priceRemainContainer.toggleRemindPanel(true);
        });
      }
    });
  },

  /**
   * 收藏商品
  */
  _addGoodsCollect: function (goodsId, callback) {
    let _this = this;

    $.ajax({
      url: $.config.REQUEST_URL +'add_cart/?step=insertGoodsToCollect&goodsId=' + goodsId,
      dataType: 'json',
      method: 'GET',
      success: function (res) {
        if (res && res.data) {
          let result = res.data;
          
          if (result.error == 0) {
            typeof callback === 'function' && callback();
            _this.data.flag_isCollected = true;
          } else {
            _this.data.flag_isCollected = false;
            wx.showToast({
              title: result.msg,
              icon: false
            })
          }

          _this.setData({
            flag_isCollected: _this.data.flag_isCollected
          });
        }
      }
    })
  },

  /**
   * 取消收藏
  */
  _cancelGoodsCollect: function (collectId) {
    let _this = this;

    $.ajax({
      url: $.config.REQUEST_URL +'www_api/user/?act=delete_collection&from=app&collection_id=' + collectId,
      dataType: 'json',
      method: 'GET',
      success: function (res) {
        if (res && res.data) {
          if (res.data.error == 0) {
            _this.data.flag_isCollected = false;
            wx.showToast({
              title: '取消收藏成功'
            })
          } else {
            _this.data.flag_isCollected = true;
            wx.showToast({
              title: res.data.msg
            })
          }

          _this.setData({
            flag_isCollected: _this.data.flag_isCollected
          });
        }
      }
    })
  },

  /**
   * 绑定购买事件
  */
  buyEvent: function() {
    // 将商品加入购物车
    if (!wx.getStorageSync('loginStatus') == true){
      wx.navigateTo({
        url: '../login/login',
      })
      return
    }
    let goodsId = this.data.goodsId;
    let goodsNumber = this.data.data_shoppingNumber;
    $.ajax({
      url: $.config.REQUEST_URL + 'ajax_flow/?step=add_to_cart_new&one_key_buy=1&goods=' + goodsId + ':' + goodsNumber,
      type: 'GET',
      dataType: 'json',
      success: function(json) {
        if (json.data) {
          let recGoods = json.data.recGoods;
          
          wx.navigateTo({
            url: '/pages/confirm-order/confirm-order?&rec=' + goodsId + ':' + recGoods[goodsId]
          })
        } 
      }
    });
  },

  /**
   * page scroll-view滚动事件
   * 加减12是因为两个模块之间有12的间距
  */
  bindPageScrollEvent: function(e) {
    let scrollTop = e.detail.scrollTop;
    let _this = this;
    if (scrollTop > 600) {
      this.setData({
        flag_backtotop: false
      })
    } else {
      this.setData({
        flag_backtotop: true
      })
    }
    if (e.detail.deltaY < 0) {
      // down
      this.data.data_tabs.forEach(function (item, index) {
        if (scrollTop >= item.top && scrollTop <= item.top + item.height) {
          _this.setData({
            tab_order: index
          });
        }
      });
    } else {
      // up
      this.data.data_tabs.forEach(function (item, index) {
        if (scrollTop < item.top + item.height && scrollTop > item.top) {
          _this.setData({
            tab_order: index
          });
        }
      });
    }

    // fixed
    if (scrollTop > this.data.data_tabs[2].top) {
      this.data.flag_goodsDetailTabHolder = false;
      this.data.flag_goodsDetailTabFixed = true;
    } else {
      this.data.flag_goodsDetailTabHolder = true;
      this.data.flag_goodsDetailTabFixed = false;
    }
    this.setData({
      flag_goodsDetailTabHolder: this.data.flag_goodsDetailTabHolder,
      flag_goodsDetailTabFixed: this.data.flag_goodsDetailTabFixed,
      scrollViewTop: scrollTop
    });
  },
  /**
   * 图片预览
  **/
  previewImage:function(e){
    console.log(e)
    let url_list = this.data.data_gallery.list
    console.log(this.data.data_gallery.list)
    let url = e.currentTarget.dataset.url
    let imagesUrl = this.data.imagesUrl
    let img_arr = [] 
    for (var i in url_list){
      img_arr.push(imagesUrl + '/' + url_list[i])
    }
    wx.previewImage({
      current: url, // 当前显示图片的http链接
      urls: img_arr // 需要预览的图片http链接列表
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 获取附近门店地址
    this.exprAddress = this.selectComponent('#exprAddressContainer');

    // 选择产品规格、颜色、。。。
    this.goodsPropery = this.selectComponent('#goodsProperyContainer');

    // 预约服务顾问
    this.countselor = this.selectComponent('#serviceCounselorContainer');

    // 降价通知
    this.priceRemainContainer = this.selectComponent('#priceRemainContainer');    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    $.track.push(['trackView']);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    let timer = new Date().getTime();
    let viewTime = timer - this.data.viewTime;

    $.track.push(['trackEvent', 'viewTime', viewTime, this.data.goodsId]);
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    let goods_id = this.data.goodsId
    let title = this.data.data_goodsInfo.title
    let url_list = this.data.data_gallery.list[0]
    let imagesUrl = this.data.imagesUrl
    let url = imagesUrl + '/' + url_list
    console.log(url)
    return {
      title: title,
      path: '/pages/goods/goods?goods_id=' + goods_id,
      imageUrl: url,
      success: function (res) {
        console.log(res)
        // 转发成功
      }
    }
  }
})

