// pages/customerData/customerData.js
const app = getApp();
const quick = require('../../utils/quick.js')
const util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '', //客户id
    mode: 'add',
    formData: {
      id: '',
      name: '',  //姓名
      sex: '',  //性别 1=女，2=男
      phone: '',  //电话
      provinceId: '', //省
      provinceName: '', //
      cityId: '', //市
      cityName: '', 
      districtId: '', //区
      districtName: '',
      neighborhood: '', //小区名称
      process: '',  //装修进度
      style: '',  //装修风格
      contact: '',  //是否美乐乐联系
      note: '', //备注
    },
    sexRange: ['女', '男'],
    processArr: [],
    styleArr: [],
    mllContact: ["是","否"],
    toggle: {
      isShowSelectAddress:false,
      isEdit: false, //是否可编辑状态
      isChecked: false
    },
    requestUrl:{
      add: 'addCustomer',
      update: "updateCustomer"
    },
    errorTips: '',
    langs:{
      incompleteTips: '提交失败，客户信息未完整填写',
      isMllCustomerTips: '该客户已为美乐乐客户，不可提交'
    },
    isShowTextarea: true
  },

  getCustomerInfo() {
    var self = this;
    var requectUrl = {
      url: 'getCustomerInfo',
    }
    var requestData = {
      belongUser: app.globalData.userShowInfo.userId,
      id: this.data.id
    }
    quick.requestGet(requectUrl, requestData).then(function (res) {
      if (!res.data.code) {
        self.setData({
          formData:JSON.parse(res.data.data)
        })
      }
    })
  },

  //验证提交数据
  checkFormData(){
    for(var key in this.data.formData){
      if (this.data.formData[key]===''&& key !='note' && key != 'id'){
        this.setData({
          'toggle.isChecked': false,
          errorTips: this.data.langs.incompleteTips
        })
        return;
      }
    }
    this.setData({
      'toggle.isChecked': true,
    })
  },

  //提交数据
  submitFormData(){
    var self = this;
    var requectUrl = {
      url: this.data.requestUrl[this.data.mode],
    }
    this.checkFormData();
    if (!this.data.toggle.isChecked) return;
    var requestData = JSON.parse(JSON.stringify(this.data.formData));
    requestData['addUser'] = app.globalData.userShowInfo.userId
    quick.requestPost(requectUrl, requestData).then(function (res) {
      if (!res.data.code) {
        quick.showToastNone('提交成功');
        setTimeout(function () {
          self.goToIndex()
        }, 1000)
      } else if (res.data.code==2){
        quick.showToastNone('该客户已存在, 提交失败');
      } else{
        quick.showToastNone('提交失败');
      }
    })
  },

  //获取装修数据
  getBaseData(){
    var self = this;
    var requectUrl = {
      url: 'getBaseData',
    }
    var requestData = {};
    quick.requestGet(requectUrl, requestData).then(function (res) {
      if (!res.data.code) {
        var response = JSON.parse(res.data.data)
        self.setData({
          processArr: response.process,
          styleArr: response.style
        })
      }
    })
  },
  //切换选择地区
  toggleAddress: function(){
    this.setData({
      isShowTextarea: !this.data.isShowTextarea,
      'toggle.isShowSelectAddress': !this.data.toggle.isShowSelectAddress
    })
  },

  saveAddress: function(e){
    var valObj = e.detail
    this.setData({
      'formData.provinceId': valObj.provinceId,
      'formData.cityId': valObj.cityId,
      'formData.districtId': valObj.districtId,
      'formData.provinceName': valObj.provinceName,
      'formData.cityName': valObj.cityName,
      'formData.districtName': valObj.districtName,
    })
  },

  //改变提交数据
  changeData(event){
    var key = event.target.dataset.key
    var changeStr = 'formData.'  + key
    var value = event.detail.value
    switch (key){
      case 'sex':
        value = parseInt(value) + 1
        break;
      case 'process':
        value = this.data.processArr[parseInt(value)].value
        break;
      case 'style':
        value = this.data.styleArr[parseInt(value)].value
        break;
      default:
        value = value;
    }
    this.setData({
      [changeStr]: value
    })
  },

  goToValidate(){
    wx.switchTab({
      url: '/pages/index/index',
      success: function () {
        wx.navigateTo({
          url: '/pages/certificationProcess/certificationProcess',
        })
      }
    })
  },

  //回到首页
  goToIndex(){
    wx.switchTab({
      url: '/pages/index/index',
      success: function () {
        console.log('sb')
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var id = options.id;
    if (!app.globalData.isCertification){
      var modalInfo = '您目前未进行分销商资质认证，不能提交客户信息。'
      quick.toggleModal('提示', modalInfo, this.goToValidate, '我要认证', '关闭', this.goToIndex)
    }
    if(id){
      wx.setNavigationBarTitle({
        title: '编辑客户资料'
      })
      this.setData({
        id: id,
        mode: 'update',
        'formData.id': id
      })
      this.getCustomerInfo()
    }
    this.getBaseData()
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})