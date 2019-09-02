// pages/favorite/favorite.js
const $ = global;
const app = getApp();
const requestPrefix = app.globalData.domain;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 屏幕宽度
    windowWidth: wx.getSystemInfoSync().windowWidth,
    filterIconActive: false, // 筛选按钮初始状态类
    filterContentHidden: true, // 筛选框显示隐藏
    filterContentCurrent: {}, // 当前选中项
    // 筛选项列表
    filterContentItemList: [],
    // 商品操作区域宽度
    handleWidth: 212,
    // 页面加载选项
    page: {
      filterKey: '0', // 筛选项
      page: 1, // 当前页数
      pageNum: 10, // 每页数量
      loadMore: true // 是否还有更多数据
    },
    // 缓存的所有筛选项第一页数据，初始没有值
    goodsList: {},
    goodsListCurrent: [] // 当前筛选的商品列表 
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
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
          this.data.goodsListCurrent.push(...data.data);

          this.setData({
            // 设置当前选中tab数据
            goodsListCurrent: this.data.goodsListCurrent
          });
        }
      }
    });
  },
  /**
   * 点击头部右上角箭头筛选
   */
  filterIconTap: function() {
    this.setData({
      filterIconActive: !this.data.filterIconActive,
      filterContentHidden: !this.data.filterContentHidden
    });
  },
  /**
   * 点击赛选遮罩，关闭筛选框
   */
  filterContentBgTap() {
    this.setData({
      filterIconActive: !this.data.filterIconActive,
      filterContentHidden: !this.data.filterContentHidden
    });
  },
  /**
   * 点击筛选项
   */
  filterContentTap: function(event) {
    const filterKey = event.currentTarget.dataset.filterKey;

    // 重新设置选中当前点击
    for (let item of this.data.filterContentItemList) {
      if (item.key == filterKey) {
        item.active = true;
        item.iconShow = true;
        this.data.filterContentCurrent = item;
      } else {
        item.active = false;
        item.iconShow = false;
      }
    }

    // 重设页面加载参数
    this.data.page.filterKey = filterKey;
    this.data.page.page = 1;

    // 判断当前tab是否有缓存的数据
    if (this.data.goodsList[filterKey]) {
      this.data.page.loadMore = (this.data.goodsList[filterKey].length >= this.data.page.pageNum);

      this.setData({
        filterContentItemList: this.data.filterContentItemList,
        filterContentCurrent: this.data.filterContentCurrent,
        filterContentHidden: true,
        filterIconActive: false,
        goodsListCurrent: this.data.goodsList[filterKey],
        page: this.data.page
      });

      return;
    }

    // 请求接口，获取当前tab第一页数据
    this.requestData({
      callback: (data) => {
        // 缓存第一页数据
        this.data.goodsList[filterKey] = data.data;
        // 更新视图
        this.setData({
          filterContentItemList: this.data.filterContentItemList,
          filterContentCurrent: this.data.filterContentCurrent,
          filterContentHidden: true,
          filterIconActive: false,
          goodsList: this.data.goodsList,
          goodsListCurrent: data.data,
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

    // 获取所有收藏的商品
    $.ajax({
      url: `${requestPrefix}/user/XcxUser/goods/`,
      dataType: 'json',
      data: {
        key: this.data.page.filterKey,
        page: this.data.page.page,
        pageNum: this.data.page.pageNum
      },
      success: (result) => {
        var data = result.data;

        setTimeout(function () {
          wx.hideLoading();
        }, 500);

        if (result.statusCode == 200) {
          //设置是否有下一页
          this.data.page.loadMore = (data.data.length >= this.data.page.pageNum);
          if (data.data.length) {
            this.data.page.page++;

            this.setData({
              page: this.data.page
            });
          }

          if (typeof params.callback === 'function') {
            params.callback.call(this, result.data);
          }
        } else {
          // 接口出错提示 TODO
        }
      },
      fail: () => {
        wx.hideLoading();
      }
    });
  },
  /**
   * 单个商品滑动开始
   */
  addressTouchStart(e) {
    // 记录开始滑动的时间和起点
    this.touchStartData = {
      changedTouches: e.changedTouches[0],
      timeStamp: e.timeStamp
    };
  },
  /**
   * 单个商品滑动结束
   */
  addressTouchEnd(e) {
    if (!this.touchStartData) {
      return;
    }

    let index = e.currentTarget.dataset.index,
      startX = this.touchStartData.changedTouches.clientX,
      startTime = this.touchStartData.timeStamp,
      endX = e.changedTouches[0].clientX,
      endTime = e.timeStamp;

    // 判断滑动方向，小于0向左，大于0向右
    if (endX - startX < 0) {
      if (this.data.goodsListCurrent[index].left >= this.data.handleWidth) {
        return;
      } else {
        trigger.call(this, false);
      }
    } else if (endX - startX > 0) {
      if (this.data.goodsListCurrent[index].left <= 0) {
        return;
      } else {
        trigger.call(this, true);
      }
    }

    /**
     * 滑动触发判断
     * param {boolean} true 向右，false 向左
     */
    function trigger(drt) {
      if ((endTime - startTime) < 300) {
        // 短时间触发
        if (Math.abs(endX - startX) > 20) {
          if (drt) {
            this.data.goodsListCurrent[index].left = 0;
            // this.data.goodsListCurrent[index].isRight = false;
          } else {
            this.data.goodsListCurrent[index].left = this.data.handleWidth;
            // this.data.goodsListCurrent[index].isRight = true;
          }
        } else {
          if (drt) {
            this.data.goodsListCurrent[index].left = this.data.handleWidth;
          } else {
            this.data.goodsListCurrent[index].left = 0;
          }
        }
      } else {
        // 长时间触发
        if (Math.abs(endX - startX) > (this.data.handleWidth * this.data.windowWidth / 750 / 2)) {
          if (drt) {
            this.data.goodsListCurrent[index].left = 0;
            // this.data.goodsListCurrent[index].isRight = false;
          } else {
            this.data.goodsListCurrent[index].left = this.data.handleWidth;
            // this.data.goodsListCurrent[index].isRight = true;
          }
        } else {
          if (drt) {
            this.data.goodsListCurrent[index].left = this.data.handleWidth;
          } else {
            this.data.goodsListCurrent[index].left = 0;
          }
        }
      }
    }

    this.setData({
      goodsListCurrent: this.data.goodsListCurrent
    });
  },
  // 取消收藏
  handleDelete(e) {
    let goodsId = e.currentTarget.dataset.goodsId,
      collectionId = e.currentTarget.dataset.collectionId;

    wx.showModal({
      title: '',
      content: '是否取消收藏该商品？',
      cancelColor: '#da0000',
      confirmColor: '#da0000',
      success: (res) => {
        if (res.confirm) {
          $.ajax({
            url: $.config.REQUEST_URL + 'www_api/user/?act=delete_collection&from=app&collection_id=' + collectionId,
            dataType: 'json',
            method: 'GET',
            success: (res) => {
              if (res && res.data) {
                if (res.data.error == 0) {
                  wx.showToast({
                    title: '取消收藏成功'
                  });

                  // 删除当前渲染列表中的这个商品
                  for (let i = 0, len = this.data.goodsListCurrent.length; i < len; i++) {
                    if (this.data.goodsListCurrent[i].id == goodsId) {
                      this.data.goodsListCurrent.splice(i, 1);
                      break;
                    }
                  }

                  // 删除缓存的全部列表中的这个商品
                  if (this.data.goodsList['0']) {
                    for (let i = 0, len = this.data.goodsList['0'].length; i < len; i++) {
                      if (this.data.goodsList['0'][i].id == goodsId) {
                        this.data.goodsList['0'].splice(i, 1);
                        break;
                      }
                    }
                  }

                  // 删除缓存的当前筛选项列表中的这个商品
                  if (this.data.goodsList[this.data.page.filterKey]) {
                    for (let i = 0, len = this.data.goodsList[this.data.page.filterKey].length; i < len; i++) {
                      if (this.data.goodsList[this.data.page.filterKey][i].id == goodsId) {
                        this.data.goodsList[this.data.page.filterKey].splice(i, 1);
                        break;
                      }
                    }
                  }

                  this.setData({
                    goodsListCurrent: this.data.goodsListCurrent,
                    goodsList: this.data.goodsList
                  });

                  // 更新收藏的分类
                  $.ajax({
                    url: `${requestPrefix}/user/XcxUser/tab/`,
                    dataType: 'json',
                    success: (result) => {
                      var data = result.data;

                      if (result.statusCode == 200) {
                        //更新tab
                        let mark = false;
                        let filterContentCurrent = null;
                        for (let i = 0, len = data.data.length; i < len; i++) {
                          if (this.data.page.filterKey == data.data[i].key) {
                            data.data[i].active = true;
                            data.data[i].iconShow = true;
                            mark = true;
                            filterContentCurrent = data.data[i];
                            break;
                          }
                        }

                        this.setData({
                          filterContentItemList: data.data,
                          filterContentCurrent: mark ? filterContentCurrent : data.data[0]
                        });

                        // 如果没有此筛选项了
                        if (!mark) {
                          this.setData({
                            goodsListCurrent: this.goodsList['0']
                          });
                        }
                      }
                    }
                  });
                } else {
                  wx.showToast({
                    title: '取消收藏失败'
                  });
                }
              }
            }
          });
        }
      }
    });
  },

  onShow: function() {
    // 获取收藏的分类
    $.ajax({
      url: `${requestPrefix}/user/XcxUser/tab/`,
      dataType: 'json',
      success: (result) => {
        var data = result.data;

        setTimeout(function () {
          wx.hideLoading();
        }, 500);

        if (result.statusCode == 200) {

          //设置默认选中
          data.data[0].active = true;
          data.data[0].iconShow = true;

          this.setData({
            filterContentItemList: data.data,
            filterContentCurrent: data.data[0]
          });
        } else {
          // 接口出错提示 TODO
        }
      },
      fail: () => {
        wx.hideLoading();
      }
    });

    // 获取默认商品数据第一页
    this.requestData({
      callback(data) {
        // 缓存第一页数据
        this.data.goodsList[this.data.page.filterKey] = data.data;
        // 更新视图
        this.setData({
          filterContentItemList: this.data.filterContentItemList,
          filterContentCurrent: this.data.filterContentCurrent,
          filterContentHidden: true,
          filterIconActive: false,
          goodsList: this.data.goodsList,
          goodsListCurrent: data.data
        });
      }
    });

    // 调用跟踪代码
    $.track.push(['trackView']);
  },
  // 页面隐藏的时候，将页面滚动加载页数重置为1，onshow的时候，从第一页开始
  onHide: function() {
    this.setData({
      'page.page': 0
    });
  }
})