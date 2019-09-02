// pages/category.js
const $ = global;
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // navigator点击后保持hover状态时间
    hoverStayTime: app.globalData.hoverStayTime, 
    // 左边nav tab数组
    categoryNav: [],
    // 所有数据缓存对象
    categoryContentList: {},
    //当前选中的nav的内容，初始为空
    categoryContentCurrent: [],
    types: {
      value: 1,
      status:''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    //判断是否登录
    app.checkUserInfoAuthorize((status) => {
      if (status) {
        that.setData({
          types: {
            value: 1,
            status: 1
          }
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 获取左边tab
    $.ajax({
      url: `${app.globalData.domain}/category/category/tab/`,
      dataType: 'json',
      success: (result) => {
        var data = result.data;
        if (result.statusCode == 200 && data.code == 200) {

          // 发送请求，获取默认第一个nav的数据
          this.getNavContent(data.data[0].key);        

          // 设置第一个tab为默认选中
          data.data[0].active = true;
          this.data.categoryNav = data.data;

          // 渲染左边tab
          this.setData({
            categoryNav: this.data.categoryNav
          });
        } else {
          // 接口出错提示 TODO
        }
      }
    });
  },
  /**
   * 点击分类nav时处理函数
   */
  handleCategoryNav: function(event) {
    const tabKey = event.currentTarget.dataset.tabKey
    
    // 重新设置选中当前点击
    for (let nav of this.data.categoryNav) {
      if (nav.key == tabKey) {
        nav.active = true;
      } else {
        nav.active = false;
      }
    }

    // 更新nav视图
    this.setData({
      categoryNav: this.data.categoryNav
    });

    // 已经有缓存的tab数据
    if (this.data.categoryContentList[tabKey]) {
      // 更新右边内容视图
      this.setData({
        categoryContentCurrent: this.data.categoryContentList[tabKey]
      });

      return;
    }

    // 请求点击的tab的右边数据
    this.getNavContent(tabKey);
  },
  /**
   * 获取某个nav对应的内容
   * @param {string} tabKey
   */
  getNavContent: function(tabKey) {
    wx.showLoading({
      title: '数据加载中'
    });
    
    $.ajax({
      url: `${app.globalData.domain}/category/category/content/`,
      data: {
        tabKey: tabKey
      },
      dataType: 'json',
      success: (result) => {
        var data = result.data;

        setTimeout(function () {
          wx.hideLoading();
        }, 500);

        if (result.statusCode == 200 && data.code == 200) {
          this.data.categoryContentList[tabKey] = data.data;
          this.data.categoryContentCurrent = data.data;

          this.setData({
            categoryContentList: this.data.categoryContentList,
            categoryContentCurrent: this.data.categoryContentCurrent
          });
        } else {
          // 接口出错提示 TODO
        }
      },
      fail: () => {
        wx.hideLoading();
      }
    });
  },
  // navContentTap(event) {
  //   const url = event.currentTarget.dataset.url;

  //   wx.navigateTo({
  //     url: '/pages/search/search?keywords=' + url.match(/\/category-(\S+?)\//)[1]
  //   });
  // },

  onShow: function() {
    let that = this
    //判断是否登录
    app.checkUserInfoAuthorize(function (status) {
      if (status) {
        that.setData({
          types: {
            value: 1,
            status: 1
          }
        })
      }
    })
    // 调用跟踪代码
    $.track.push(['trackView']);
  },
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