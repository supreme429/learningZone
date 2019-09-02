// pages/scanCodeReceiving/serviceEvaluationDetail/serviceEvaluationDetail.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    evaDataList: [],
    feedback: '',  //反馈意见
  },

  getEvalData: function(){
    var self = this;
    var requectUrl = {
      url: 'getOrderServiceItemInfo',
    }
    var requestData = { deliveryNo: app.globalData.scanCodeRecevingInfo.deliveryNo }
    app.requestGet(requectUrl, requestData).then(function (res) {
      if (!res.data.code) {
        var resData = JSON.parse(res.data.data)
        self.setData({
          evaDataList: resData.evaluateList,
          feedback: resData.feedback
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getEvalData()
  },


})