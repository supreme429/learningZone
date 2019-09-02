// pages/customerList/customerList.js
const app = getApp();
const quick = require('../../utils/quick.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchValue: "", // 搜索内容
    status: "",
    listHeight: '300px',
    page: 1, // 页码
    isEnd: false, // 是否最后一页
    listData: [
      // {
      //   "id": "1",
      //   "name": "姓名",
      //   "date": "2018/01/01 12:00",
      //   "status": "0"
      // },
      // {
      //   "id": "1",
      //   "name": "姓名",
      //   "date": "2018/01/01 12:00",
      //   "status": "1"
      // }
    ],

    tabs: [
      {
        title: '全部',
        value: ''
      },
      {
        title: '已过期',
        value: 1
      },
    ],

    statusToString: {
      0: "生效中",
      1: "已过期"
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.countListHeight();
  },

  onShow: function () {
    this.setData({
      listData: [],
      page: 1,
      isEnd: false
    })
    wx.showLoading({
      title: ''
    })
    this.getData();
  },

  getData() {
    if (this.data.isEnd) return;
    const userShowInfo = app.globalData.userShowInfo;
    const data = {
      belongUser: userShowInfo.userId,
      keyword: this.data.searchValue,
      status: this.data.status,
      page: this.data.page++
    }
    quick.requestGet({ url: 'getCustomerList' }, data).then((res) => {
      res.data.data = JSON.parse(res.data.data);
      const { code, data } = res.data;
      if (code === 0) {
        wx.hideLoading()
        this.setData({
          listData: this.data.listData.concat(data.list),
          isEnd: data.isEnd
        })
      }
    })
  },

  changeTab(e) {
    if (e.currentTarget.dataset.status === this.data.status) return;
    this.setData({
      listData: [],
      status: e.currentTarget.dataset.status,
      page: 1,
      isEnd: false,
    })
    this.getData();
  },

  inputSearchValue(e) {
    this.setData({
      searchValue: e.detail.value
    })
  },

  search() {
    this.data.page = 1;
    this.setData({
      listData: [],
      isEnd: false,
    })
    this.getData();
  },

  // 计算客户列表高度
  countListHeight() {
    let windowHeight = 0;
    wx.getSystemInfo({
      success: (res) => {
        windowHeight = res.windowHeight;

        wx.createSelectorQuery().select('#box').fields({
          dataset: true,
          size: true,
          scrollOffset: true,
          // properties: ['scrollX', 'scrollY'],
          // computedStyle: ['margin', 'backgroundColor']
        }, res => {
          this.setData({
            listHeight: windowHeight - res.height + 'px'
          })
        }).exec()
      }
    })
  }
})