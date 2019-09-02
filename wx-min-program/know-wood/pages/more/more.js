// pages/more/more.js
const quick = require('../../utils/quick.js');
const util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    firstLabelList: [
      {
        firstName: '地域分布',
        secondLabelList: [
          {
            labelId: '1',
            labelName: '亚洲'
          },
          {
            labelId: '2',
            labelName: '欧洲'
          },
          {
            labelId: '3',
            labelName: '非洲'
          },
          {
            labelId: '3',
            labelName: '美洲'
          }
        ]
      },
      {
        firstName: '使用途径',
        secondLabelList: [
          {
            labelId: '2',
            labelName: '家居材料'
          }
        ]
      }
    ]
  },

  searchMoreClassfiyTag(){
    quick.requestGet({ url: 'searchMoreClassfiyTag' }).then((res) => {
      const { code, data } = res.data;
      if (code === 0) {
        this.setData({
          firstLabelList: data
        })
      }
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.searchMoreClassfiyTag()
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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})