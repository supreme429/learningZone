// pages/mine/mine.js
const $ = global;
const app = getApp();
const requestPrefix = app.globalData.domain;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 用户名
    userName: '',
    // 用户等级
    levelName: '',
    // 用户头像
    avatar: '',
    // navigator点击后保持hover状态时间
    hoverStayTime: app.globalData.hoverStayTime, 
    // 我的订单tab
    orderTab: [
      {
        name: '待付款',
        filterKey: '100',
        num: null
      },
      {
        name: '待发货',
        filterKey: '101',
        num: null
      },
      {
        name: '待收货',
        filterKey: '8',
        num: null
      }
    ],
    types: {
      value: 2,
      status:''
    },
    hidden:true
  },
  confirm:function(){
    wx.navigateTo({
      url: '../login/login',
    })
  },
  //判断是否登陆
  isLodin:function(){
    if (!wx.getStorageSync('loginStatus')) {
      this.setData({
        hidden:false
      })
    }else{
      this.setData({
        hidden: true
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.isLodin()
    $.ajax({
      url: `${requestPrefix}/user/XcxUser/info/`,
      success: (result) => {
        if (result.statusCode == 200 && result.data.code == 200) {
          this.setData({
            userName: result.data.data.user_name,
            levelName: result.data.data.level_name,
            avatar: result.data.data.avatar
          });
        }
      }
    });

    // 获取订单数量
    $.ajax({
      url: `${requestPrefix}/user/XcxUser/order_num/`,
      success: (result) => {
        let data = result.data;

        if (result.statusCode == 200 && data.code == 200) {
          for (let value of this.data.orderTab) {
            if (data.data[value.filterKey] && data.data[value.filterKey].num >= 0) {
              value.num = data.data[value.filterKey].num;
            }
          }

          this.setData({
            orderTab: this.data.orderTab
          });
          
        }
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  onShow: function() {
    this.isLodin()
    $.ajax({
      url: `${requestPrefix}//user/XcxUser/info/`,
      success: (result) => {
        if (result.statusCode == 200 && result.data.code == 200) {
          this.setData({
            userName: result.data.data.user_name,
            levelName: result.data.data.level_name,
            avatar: result.data.data.avatar
          });
        }
      }
    });
    // 获取订单数量
    $.ajax({
      url: `${requestPrefix}/user/XcxUser/order_num/`,
      success: (result) => {
        let data = result.data;

        if (result.statusCode == 200 && data.code == 200) {
          for (let value of this.data.orderTab) {
            if (data.data[value.filterKey] && data.data[value.filterKey].num >= 0) {
              value.num = data.data[value.filterKey].num;
            }
          }

          this.setData({
            orderTab: this.data.orderTab
          });
          
        }
      }
    });
    // 调用跟踪代码
    $.track.push(['trackView']);
  }
})