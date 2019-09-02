// pages/comment/comment.js
const $ = global;
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    limitStart: 0, // 评论数取值偏移量
    limitEnd: 20, // 往后取多少条
    slash: 'all',  // 筛选项参数
    loadMore: true, // 是否还有更多数据
    tabList: [], //顶部切换数组
    commentDataList: {}, // 所有tab第一屏数据缓存，初始没有值
    commentCurrentData: [] // 选中的tab评论数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 设置评论商品id
    this.setData({
      goodsId: options.goodsId
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 加载全部的第一屏
    // 请求数据
    this.requestData({
      callback: function(data) {
        // 缓存all的第一屏
        this.data.commentDataList['all'] = data.comment_list || [];
        // 设置当前选中数据
        this.data.commentCurrentData = data.comment_list || [];
        // 设置tab数据
        this.data.tabList = [
          {
            name: '全部',
            slash: 'all',
            count: data.comments_count > 9999 ? Math.floor(data.comments_count / 10000) + '万+' : data.comments_count,
            activeClass: 'active'
          },
          {
            name: '满意',
            slash: 'high',
            count: data.comment_level_count.high > 9999 ? Math.floor(data.comment_level_count.high / 10000) + '万+' : data.comment_level_count.high
          },
          {
            name: '一般',
            slash: 'middle',
            count: data.comment_level_count.middle > 9999 ? Math.floor(data.comment_level_count.middle / 10000) + '万+' : data.comment_level_count.middle
          },
          {
            name: '不满意',
            slash: 'low',
            count: data.comment_level_count.low > 9999 ? Math.floor(data.comment_level_count.low / 10000) + '万+' : data.comment_level_count.low
          },
          {
            name: '秀家',
            slash: 'only_show',
            count: data.comment_level_count.only_show > 9999 ? Math.floor(data.comment_level_count.only_show / 10000) + '万+' : data.comment_level_count.only_show
          }
        ];

        // 判断是否有下一页数据
        if (data.current < data.totalpage) {
          this.data.loadMore = true;
        } else {
          this.data.loadMore = false;
        }

        this.setData({
          limitStart: this.data.limitStart + this.data.limitEnd, // 设置评论取值偏移量
          // 设置tab数组
          tabList: this.data.tabList,
          // 设置当前选中tab数据
          commentCurrentData: this.data.commentCurrentData,
          // 缓存all的第一屏
          commentDataList: this.data.commentDataList,
          // 设置是否有下一页
          loadMore: this.data.loadMore
        });
      }
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    // 如果没有更多数据
    if (!this.data.loadMore) {
      return;
    }

    // 触底加载
    // 请求数据
    this.requestData({
      callback: function(data) {
        // 将获取到的本页数据，push到当前数据数组中
        this.data.commentCurrentData.push(...data.comment_list);

        // 判断是否有下一页数据
        if (data.current < data.totalpage) {
          this.data.loadMore = true;
        } else {
          this.data.loadMore = false;
        }

        this.setData({
          // 设置评论取值偏移量
          limitStart: this.data.limitStart + this.data.limitEnd,
          // 设置当前选中tab数据
          commentCurrentData: this.data.commentCurrentData,
          // 设置是否有下一页
          loadMore: this.data.loadMore
        });
      }
    });
  },
  /**
   * 点击tab切换
   */
  tabTap: function(event) {
    const slash = event.currentTarget.dataset.slash;
    // 设置tab slash
    this.data.slash = slash;
    // 重置偏移量为0
    this.data.limitStart = 0;

    // 重新设置选中当前点击
    for (let tab of this.data.tabList) {
      if (tab.slash == slash) {
        tab.activeClass = 'active';
      } else {
        tab.activeClass = '';
      }
    }

    // 如果有当前tab的缓存数据，直接使用
    if (this.data.commentDataList[slash]) {
      this.setData({
        commentCurrentData: this.data.commentDataList[slash],
        // 设置评论取值偏移量
        limitStart: this.data.limitStart + this.data.limitEnd,
        // 设置tab选中
        tabList: this.data.tabList
      });

      return;
    }
    
    // 请求数据
    this.requestData({
      callback: function(data) {
        // 缓存当前tab的第一屏
        this.data.commentDataList[slash] = data.comment_list || [];
        // 设置当前选中tab数据
        this.data.commentCurrentData = data.comment_list || [];

        // 判断是否有下一页数据
        if (data.current < data.totalpage) {
          this.data.loadMore = true;
        } else {
          this.data.loadMore = false;
        }

        this.setData({
          // 设置评论取值偏移量
          limitStart: this.data.limitStart + this.data.limitEnd,
          // 设置当前tab slash
          slash: this.data.slash,
          // 设置当前选中tab数据
          commentCurrentData: this.data.commentCurrentData,
          // 缓存当前tab的第一屏
          commentDataList: this.data.commentDataList,
          // 设置tab选中
          tabList: this.data.tabList,
          // 设置是否有下一页
          loadMore: this.data.loadMore
        });
      }
    });
  },
  /**
   * 公共请求数据方法
   * @params [object] 参数对象，默认为空对象
   */
  requestData: function(params = {}) {
    wx.showLoading({
      title: '数据加载中'
    });

    $.ajax({
      url: `${app.globalData.Login_url}mll_api/api/goods_comment`,
      data: {
        goods_id: this.data.goodsId,
        limit_start: this.data.limitStart,
        limit_end: this.data.limitEnd,
        slash: this.data.slash == 'all' ? '' : this.data.slash //接口slash传all，totalpage会有问题，所以做个处理，传空字符串
      },
      dataType: 'json',
      success: (result) => {
        var data = result.data;

        setTimeout(function () {
          wx.hideLoading();
        }, 500); 

        if (result.statusCode == 200) {
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
     * 图片预览
    **/
  previewImage: function (e) {
    let url = e.currentTarget.dataset.url
    let index = e.currentTarget.dataset.index
    let commentCurrentData = this.data.commentCurrentData
    let url_list = commentCurrentData[index].pic_list
    let img_arr = []
    for (var i in url_list) {
      img_arr.push('https:' + url_list[i].img)
    }
    // console.log(commentCurrentData)
    wx.previewImage({
      current: url, // 当前显示图片的http链接
      urls: img_arr // 需要预览的图片http链接列表
    })
  },
  onShow: function() {
    // 调用跟踪代码
    $.track.push(['trackView']);
  }
})