// pages/user/user.js
const app = getApp();
const { config, env } = require('../../config/config.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 用户信息
    userInfo: {},
    // 用户tag
    userTags: [],

    // 当前tab
    currentTab: 0,

    // 浏览轨迹数据是否已加载
    isLoadTrackData: false,
    // 浏览轨迹数据
    tarckJson: [],

    // 跟进记录数据是否已加载
    isLoadRecordData: false,
    // 跟进记录数据
    recordJson: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getUserInfo();
    this._getTrackData();
  },

  /**
   * 获取用户信息
   */
  getUserInfo: function() {
    let openId = wx.getStorageSync('openId');
    console.log('进入getUserInfo方法')
    console.log('openId:'+ openId);
    console.log(openId)
    console.log('请求地址：');
    console.log(`${env.baseUrl}/rest/ntpl/oauthuser/getWxUserInfo?openId=${openId}`)
    wx.request({
      url: `${env.baseUrl}/rest/ntpl/oauthuser/getWxUserInfo?openId=${openId}`,
      method: 'GET',
      dataType: 'json',
      success: (res) => {
        console.log('请求返回')
        console.log(res);
        if (res.data.error == 0) {
          this.data.userInfo = res.data.data;
          
          this.setData({
            userInfo: this.data.userInfo
          });
        }
      }
    })
  },

  /**
   * 切换tab
   */
  switchTab: function(e) {
    let index = e.target.dataset.index;

    this.data.currentTab = index;

    if (index == 1 && !this.data.isLoadRecordData) {
      this._getRecordData();
    }

    this.setData({
      currentTab: this.data.currentTab
    });
  },

  /**
   * 获取浏览轨迹数据
   */
  _getTrackData: function() {
    let phone = wx.getStorageSync('phone');

    wx.request({
      url: `${env.crm}/mllCRM/salesAssistant.do?accessDetailForWx&mobile=${phone}`,
      method: 'GET',
      dataType: 'json',
      success: (res) => {
        if (res && res.data) {
          this.data.isLoadTrackData = true;
          this.data.tarckJson = res.data.dataList;
          this.data.userTags = res.data.data.lableinfo;

          this.data.tarckJson.forEach((item) => {
            item.date = item.start_time.split('-')
            item.info.forEach((goods) => {
              goods.thumb = config.mllPublicImgUrl + goods.goods_thumb;
              goods.url = goods.curr_url.replace(/^http(s?):\/\/(test|www|m)\.meilele\.com/, '').replace(/\?(.*)/, '');
            });
          });

          this.setData({
            userTags: this.data.userTags,
            isLoadTrackData: this.data.isLoadTrackData,
            tarckJson: this.data.tarckJson
          });
        } else {
          this.data.isLoadTrackData = false;
          this.data.tarckJson = null;
          this.setData({
            isLoadTrackData: this.data.isLoadTrackData,
            tarckJson: this.data.tarckJson
          });
        }
      },
      error: () => {
        this.data.isLoadTrackData = false;
        this.data.tarckJson = null;
        this.setData({
          isLoadTrackData: this.data.isLoadTrackData,
          tarckJson: this.data.tarckJson
        });
      }
    })
  },

  /**
   * 跳转到商品详情页 web view
   */
  viewGoods: function(e) {
    let url = e.target.dataset.url;
    let jumpUrl = url.replace(/\?.*/);

    wx.navigateTo({
      url: `/pages/goods/goods?url=${url}`
    })
  },

  /**
   * 获取用户跟进记录数据
   */
  _getRecordData: function() {
    let phone = wx.getStorageSync('phone');

    wx.request({
      url: `${env.crm}/mllCRM/salesAssistant.do?taskRecordForWx&mobile=${phone}`,
      method: 'GET',
      dataType: 'json',
      success: (res) => {
        if (res.data.error == 0) {
          res.data.data 

          this.data.isLoadRecordData = true;
          this.data.recordJson = res.data.data;
          this.setData({
            isLoadRecordData: this.data.isLoadRecordData,
            recordJson: this.data.recordJson
          });
        } else {
          this.data.isLoadRecordData = false;
          this.data.recordJson = null;
          this.setData({
            isLoadRecordData: this.data.isLoadRecordData,
            recordJson: this.data.recordJson
          });
        }
      },
      error: () => {
        this.data.isLoadRecordData = false;
        this.data.recordJson = null;
        this.setData({
          isLoadRecordData: this.data.isLoadRecordData,
          recordJson: this.data.recordJson
        });
      }
    })
  }
})