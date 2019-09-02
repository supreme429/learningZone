// pages/certificationProcess/certificationProcess.js
const quick = require('../../utils/quick.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nodes: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    quick.requestGet({ url: 'getAgreement' }).then(res => {
      const { code, data } = res.data;
      if(code === 0) {
        this.setData({
          nodes: data.agreement
        })
      }
    });
  },
})