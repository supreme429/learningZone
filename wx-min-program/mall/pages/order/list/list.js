// pages/order/list/list.js
const $ = global;
const app = getApp();
const ajax = require('../../../utils/ajax.js');
const requestPrefix = app.globalData.domain;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // navigator点击后保持hover状态时间
    hoverStayTime: app.globalData.hoverStayTime, 
    // 点击取消时的orderId
    selectOrderId: '',
    tabList: [
      {
        filterKey: '0',
        name: '全部订单',
        active: true,
        realName: '全部订单'
      },
      {
        filterKey: '100',
        name: '待付款',
        realName: '待付款'
      },
      {
        filterKey: '101',
        name: '待发货',
        realName: '待发货'
      },
      {
        filterKey: '8',
        name: '待收货',
        realName: '已发货'
      }
    ],
    //当前的状态name值
    currentStatus:'',
    // 缓存的各状态订单数据
    orderCacheData: {},
    orderListCurrent: [], // 当前渲染的订单列表 
    // 滚动加载页面参数
    page: {
      page: 1,
      filterKey: '0',
      loadMore: true
    }
  },

  onLoad(options) {
    let filterKey = options.filterKey;
    let currentStatus = this.data.currentStatus;
    if (filterKey && filterKey != '0') {
      this.data.page.filterKey = filterKey;
      // 重新设置选中当前点击
      for (let item of this.data.tabList) {
        if (item.filterKey == filterKey) {
          item.active = true;
          currentStatus = item.realName
        } else {
          item.active = false;
        }
      }
    }else{
      currentStatus = '全部订单'
    }
    this.setData({
      tabList: this.data.tabList,
      currentStatus: currentStatus
    });
    // console.log('currentStatus', currentStatus)
  },
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 获取默认商品数据第一页
    // this.requestData({
    //   callback(data) {
    //     // 缓存第一页数据
    //     this.data.orderCacheData[this.data.page.filterKey] = data.data;
    //     // 更新视图
    //     this.setData({
    //       orderCacheData: this.data.orderCacheData,
    //       orderListCurrent: data.data
    //     });
    //   }
    // });

    // 取消订单
    //this.cancelOrderComponent = this.selectComponent('#cancelOrderContainer');
  },

  /**
  * 页面上拉触底事件的处理函数
  */
  onReachBottom: function () {
    // 如果没有更多数据
    if (!this.data.page.loadMore) {
      return;
    }

    // 触底加载
    // 请求数据
    this.requestData({
      callback: function (data) {
        if (data.data.length > 0) {
          // 将获取到的本页数据，push到当前数据数组中
          this.data.orderListCurrent.push(...data.data);

          this.setData({
            // 设置当前选中tab数据
            orderListCurrent: this.data.orderListCurrent
          });
        }
      }
    });
  },
  /**
   * 点击筛选项
   */
  tabTap: function (event) {
    const filterKey = event.currentTarget.dataset.filterKey;
    let currentStatus = this.data.currentStatus;
    // 重新设置选中当前点击
    for (let item of this.data.tabList) {
      if (item.filterKey == filterKey) {
        item.active = true;
        currentStatus = item.realName
      } else {
        item.active = false;
      }
    }
    this.setData({
      currentStatus: currentStatus
    })
    // 重设页面加载参数
    this.data.page.filterKey = filterKey;
    this.data.page.loadMore = true;

    // 判断当前tab是否有缓存的数据
    if (this.data.orderCacheData[filterKey]) {
      this.data.page.page = 2;

      this.setData({
        tabList: this.data.tabList,
        orderListCurrent: this.data.orderCacheData[filterKey],
        page: this.data.page
      });

      this.checkDataList();
      return;
    }

    // 请求接口，获取当前tab第一页数据
    this.data.page.page = 1;
    this.requestData({
      callback: (data) => {
        // 缓存第一页数据
        this.data.orderCacheData[filterKey] = data.data;
        // 更新视图
        this.setData({
          tabList: this.data.tabList,
          orderCacheData: this.data.orderCacheData,
          orderListCurrent: data.data,
          page: this.data.page
        });
      }
    });
  },
  /**
   * 公共请求数据方法
   * @params [object] 参数对象，默认为空对象
   */
  requestData: function (params = {}) {
    wx.showLoading({
      title: '数据加载中',
      mask: true
    });

    // 获取所有订单
    $.ajax({
      url: `${requestPrefix}/user/XcxUser/order_list/`,
      dataType: 'json',
      data: {
        composite_status: this.data.page.filterKey,
        page: this.data.page.page
      },
      success: (result) => {
        var data = result.data;

        setTimeout(function () {
          wx.hideLoading();
        }, 500);
        // console.log(data);
        if (result.statusCode == 200) {
          //设置是否有下一页
          if (data.data.length) {
            this.data.page.page++;
            this.data.page.loadMore = true;
          } else {
            this.data.page.loadMore = false;
          }

          this.setData({
            page: this.data.page
          });

          if (typeof params.callback === 'function') {
            params.callback.call(this, result.data);
          }

          this.checkDataList();
        }
      },
      fail: () => {
        wx.hideLoading();
      }
    });
  },
  /**
   * 跳转到订单详情页
   */
  navigatorToDetail(e) {
    let orderSn = e.currentTarget.dataset.orderSn;

    wx.navigateTo({
      url: `/pages/order/detail/detail?orderSn=${orderSn}`
    });
  },
  /**
   * 订单操作
   */
  orderHandler(e) {
    let orderStatus = e.currentTarget.dataset.orderStatus,
      orderId = e.currentTarget.dataset.orderId,
      orderSn = e.currentTarget.dataset.orderSn;
    let that = this;
      // 设置选中的id
      this.setData({
        selectOrderId: orderId
      });
    
    switch (orderStatus) {
      case '确认收货':
      // case '付款':
        wx.showModal({
          title: '',
          content: '你确认已经收到货物了吗？',
          cancelColor: '#da0000',
          confirmColor: '#da0000',
          success: (res) => {
            if (res.confirm) {
              $.ajax({
                url: `${app.globalData.Login_url}user/?act=affirm_received`,
                data: {
                  order_id: orderId
                },
                success: (result) => {
                  if (result.statusCode == 200) {
                    if (result.data.error == 0) {
                      wx.showToast({
                        mask: true,
                        duration: 1000,
                        title: '确认收货成功！'
                      });

                      // 将渲染列表中此订单的状态修改为已确认
                      for (let i = 0, len = that.data.orderListCurrent.length; i < len; i++) {
                        if (that.data.orderListCurrent[i].order_id == orderId) {
                          that.data.orderListCurrent[i].handler = null;
                          that.data.orderListCurrent[i].order_status_format = '已确认';
                        }
                      }
                      if (that.data.orderCacheData['0']){
                        // 将缓存的全部订单第一页数据中的此订单状态修改为已确认
                        for (let i = 0, len = that.data.orderCacheData['0'].length; i < len; i++) {
                          if (that.data.orderCacheData['0'][i].order_id == orderId) {
                            that.data.orderCacheData['0'][i].handler = null;
                            that.data.orderCacheData['0'][i].order_status_format = '已确认';
                          }
                        }
                      }
                      if (that.data.orderCacheData['8']) {
                        // 将缓存的待收货订单第一页数据中的此订单状态修改为已确认
                        for (let i = 0, len = that.data.orderCacheData['8'].length; i < len; i++) {
                          if (that.data.orderCacheData['8'][i].order_id == orderId) {
                            that.data.orderCacheData['8'][i].handler = null;
                            that.data.orderCacheData['8'][i].order_status_format = '已确认';
                          }
                        }
                      }
                      
                      that.setData({
                        orderListCurrent: that.data.orderListCurrent,
                        orderCacheData: that.data.orderCacheData
                      });
                      console.log('orderListCurrent', that.data.orderListCurrent)
                      that.checkDataList();
                    }
                  }
                }
              });
            } else if (res.cancel) {

            }
          }
        });
        break;
      case '取消订单':
        this.cancelOrderComponent.toggleDisplayStatus();
        break;
      default:
      wx.navigateTo({
        url: `/pages/order/detail/detail?orderSn=${orderSn}`
      });
    }
  },

  /**
   * 取消订单后的回调函数
  */
  cancelOrderCallback: function () {
    let orderId = this.data.selectOrderId;

    // 将渲染列表中此订单的状态修改为已取消
    for (let i = 0, len = this.data.orderListCurrent.length; i < len; i++) {
      if (this.data.orderListCurrent[i].order_id == orderId) {
        this.data.orderListCurrent[i].handler = null;
        this.data.orderListCurrent[i].order_status_format = '已取消';
      }
    }
    if (this.data.orderCacheData['0']){
      // 将缓存的全部订单第一页数据中的此订单状态修改为已取消
      for (let i = 0, len = this.data.orderCacheData['0'].length; i < len; i++) {
        if (this.data.orderCacheData['0'][i].order_id == orderId) {
          this.data.orderCacheData['0'][i].handler = null;
          this.data.orderCacheData['0'][i].order_status_format = '已取消';
        }
      }
    }
    // 将缓存的待付款订单第一页数据中的此订单状态修改为已取消
    if (this.data.orderCacheData['100']) {
      for (let i = 0, len = this.data.orderCacheData['100'].length; i < len; i++) {
        if (this.data.orderCacheData['100'][i].order_id == orderId) {
          this.data.orderCacheData['100'][i].handler = null;
          this.data.orderCacheData['100'][i].order_status_format = '已取消';
        }
      }
    }
    this.setData({
      orderListCurrent: this.data.orderListCurrent,
      orderCacheData: this.data.orderCacheData
    });

    this.checkDataList();
  },

  // 搜索订单提交
  searchSubmit(e) {
    let value = e.detail.value;

    if (!value) {
      return;
    }

    wx.showLoading({
      title: '数据加载中',
      mask: true
    });

    // 获取所有订单
    $.ajax({
      url: `${requestPrefix}/user/XcxUser/goodsSearch/`,
      dataType: 'json',
      data: {
        goods_name: value,
      },
      success: (result) => {
        var data = result.data;

        setTimeout(function () {
          wx.hideLoading();
        }, 500);

        if (result.statusCode == 200 && data.code == 200) {
          this.data.page.loadMore = false;

          this.setData({
            page: this.data.page,
            orderListCurrent: data.data
          });
        } else {
          this.setData({
            orderListCurrent: []
          });
        }

        for (let value of this.data.tabList) {
          value.active = false;
        }

        this.setData({
          tabList: this.data.tabList
        });

        this.checkDataList();
      },
      fail: () => {
        wx.hideLoading();
      }
    });
  },

  // 检查是否订单列表为空
  checkDataList() {
    if (this.data.orderListCurrent.length) {
      this.data.orderNoData = false;
    } else {
      this.data.orderNoData = true;
    }

    this.setData({
      orderNoData: this.data.orderNoData
    })
  },

  onShow: function() {
    let pages = this.data.page
    pages.page = 1
    this.setData({
      page: pages,
      orderCacheData: {},
      orderListCurrent: []
    })
    // 获取默认商品数据第一页
    this.requestData({
      callback(data) {
        // 缓存第一页数据
        this.data.orderCacheData[this.data.page.filterKey] = data.data;
        // 更新视图
        this.setData({
          orderCacheData: this.data.orderCacheData,
          orderListCurrent: data.data
        });
      }
    });

    // 取消订单
    this.cancelOrderComponent = this.selectComponent('#cancelOrderContainer');
    // 调用跟踪代码
    $.track.push(['trackView']);
  }
})