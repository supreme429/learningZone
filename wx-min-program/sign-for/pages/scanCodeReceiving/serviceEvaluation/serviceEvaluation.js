// pages/scanCodeReceiving/serviceEvaluation/serviceEvaluation.js
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    evaDataList: [],
    evaFormData: {  //提交的服务评价数据
      orderId: '',
      orderSn: '',  //订单号
      deliveryNo: '',
      signOpenId: '',
      signPhone: '',
      consignee: '',  //收货人
      feedback: '', //反馈意见
      evaluateList: []
    },
    count: 0,  //反馈意见字数
    toggle: {
      isChecked: false,
      evaSuccess: false,
      isShowRedModal: false,
      isDbSave: false,
    }
  },

  //获取服务评价项信息
  getServiceItem: function () {
    var self = this;
    var requectUrl = {
      url: 'getServiceItem',
    }
    var requestData = { deliveryNo: app.globalData.scanCodeRecevingInfo.deliveryNo }
    app.requestGet(requectUrl, requestData).then(function (res) {
      if (!res.data.code) {
        self.setData({
          evaDataList: JSON.parse(res.data.data)
        })
        self.initEvalFormData()
      }
    })
  },

  // 重置服务子项选择
  resetSelectSonItem: function (evaItemIndex,serviceList){
    if (!serviceList) return;
    for (var i = 0;i<serviceList.length; i++){
      var selectServiceStr = "evaDataList[" + evaItemIndex + "].serviceList[" + i + "]" + '.select';
      this.setData({
        [selectServiceStr]: 0
      })
    }
  },

  // 选择服务星数
  selectStart: function (e) {
    var index = e.currentTarget.dataset.index;
    var evaItemIndex = e.currentTarget.dataset.evaitemindex;
    var startNumStr = "evaFormData.evaluateList[" + evaItemIndex + "].serviceStar";
    var sonSerListStr = "evaFormData.evaluateList[" + evaItemIndex + "].serviceList";
    this.setData({
      [startNumStr]: index + 1
    })
    if (index>1){
      this.setData({
        [sonSerListStr]: []
      })
      this.resetSelectSonItem(evaItemIndex, this.data.evaDataList[evaItemIndex].serviceList)
    }
    this.checkFormData()
  },
  // 取消服务星数
  cancelStart: function (e) {
    var index = e.currentTarget.dataset.index;
    var evaItemIndex = e.currentTarget.dataset.evaitemindex;
    var startNumStr = "evaFormData.evaluateList[" + evaItemIndex + "].serviceStar";
    this.setData({
      [startNumStr]: index + 1
    })
    this.checkFormData()
  },

  //选择服务子项
  selectSonService: function (e) {
    var index = e.currentTarget.dataset.index;
    var evaItemIndex = e.currentTarget.dataset.evaitemindex;
    var startNumStr = "evaFormData.evaluateList[" + evaItemIndex + "].serviceList[" + index + "]";
    var selectServiceStr = "evaDataList[" + evaItemIndex + "].serviceList[" + index + "]" + '.select';
    var serviceSonObj = this.data.evaDataList[evaItemIndex].serviceList[index]
    var serviceFormList = this.data.evaFormData.evaluateList[evaItemIndex].serviceList

    var serviceSonStr = "evaFormData.evaluateList[" + evaItemIndex + "].serviceList"
    //判断是否已经选中,如已选中则取消，否则选中
    var tag = 0;
    this.data.evaFormData.evaluateList[evaItemIndex].serviceList.find((o, index) => {
      if (o && o.serviceSonId == serviceSonObj.serviceSonId) {
        this.data.evaFormData.evaluateList[evaItemIndex].serviceList.splice(index, 1);
        tag = 1
        return true;
      }
    })
    if (!tag) {
      this.data.evaFormData.evaluateList[evaItemIndex].serviceList.push({ serviceSonId: serviceSonObj.serviceSonId });
    }
    this.setData({
      [serviceSonStr]: this.data.evaFormData.evaluateList[evaItemIndex].serviceList,
      [selectServiceStr]: !tag
    })
  },

  //初始化要提交的服务评价数据
  initEvalFormData: function () {
    var evaluateList = [];
    for (var i = 0; i < this.data.evaDataList.length; i++) {
      evaluateList.push({
        serviceId: this.data.evaDataList[i].serviceId,
        serviceStar: 0,
        serviceList: []
      })
    };
    this.setData({
      'evaFormData.deliveryNo': app.globalData.scanCodeRecevingInfo.deliveryNo,
      'evaFormData.signOpenId': app.globalData.openId,
      'evaFormData.signPhone': app.globalData.wxPhone,
      'evaFormData.evaluateList': evaluateList
    })
  },

  //设置反馈意见
  setFeedBack: function (event) {
    this.setData({
      'evaFormData.feedback': event.detail.value,
      'count': event.detail.value.length
    })
  },

  //验证提交的数据
  checkFormData: function () {
    for (var i = 0; i < this.data.evaFormData.evaluateList.length; i++) {
      if (!this.data.evaFormData.evaluateList[i].serviceStar) {
        this.setData({
          'toggle.isChecked': false
        })
        return;
      }
    }
    this.setData({
      'toggle.isChecked': true
    })
  },

  // 提交服务评价
  commitEva: function () {
    var self = this;
    if (!this.data.toggle.isChecked || this.data.toggle.isDbSave) return;
    this.data.toggle.isDbSave = true
    var requectUrl = {
      url: 'serviceEvaluate',
    }
    var requestData = this.data.evaFormData
    app.requestPost(requectUrl, requestData).then(function (res) {
      if (res.data.code === 0) {
        self.setData({
          'toggle.evaSuccess': true
        })
        //设置本地状态为已经评价
        wx.setStorage({ key: 'evaluateStatus', data: '1' });
        // 评价成功清除缓存数据【收货人手机号，货运单号】
        wx.removeStorage({ key: 'consigneePhone' });
        wx.removeStorage({ key: 'deliveryNo' });
        wx.redirectTo({
          url: '../serviceEvaluationComplate/serviceEvaluationComplate'
        })
      } else if (res.data.code === 3) {
        wx.showToast({
          title: '评价已提交，请查看详情',
          icon: 'none',
          success: () => {
            setTimeout(() => {
              wx.redirectTo({
                url: '/pages/scanCodeReceiving/serviceEvaluationDetail/serviceEvaluationDetail',
              })
            }, 1000)
          }
        })
      } else {
        const copyWrite = {
          1: '提交失败，请稍后再试',
          2: '评价已提交，请稍等',
        }
        wx.showToast({
          title: copyWrite[res.data.code] || copyWrite[1],
          icon: 'none'
        })
        self.data.toggle.isDbSave = false
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var consignee = options.consignee;
    var orderId = options.orderId;
    var orderSn = options.orderSn
    this.setData({
      'evaFormData.consignee': consignee,
      'evaFormData.orderId': orderId,
      'evaFormData.orderSn': orderSn,
    })
    this.getServiceItem()
  },

})