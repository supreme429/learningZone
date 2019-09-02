// pages/gifts/gifts.js
const app = getApp();
const { config, env } = require('../../config/config.js');
// 引入支持async/await
import regeneratorRuntime from '../../utils/runtime.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    btnMsg: '扫码核销',
    scanCodeImgUrl: '../../images/icon-fingerprint.png',
    userName: wx.getStorageSync('user').userName,
    exprId: '',
    level1: '',
    level2: '',
    actionType: '',
    activeName: '',
    mchId: '111',
    userId: wx.getStorageSync('user').userId
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // this.getCodeParmas();
    this.getCodeParmasNew();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },
  // 异步获取到店礼品二维码
  getCodeParmasNew: function () {
    let that = this;
    try {
      async function asyncGetCodeParmasNew() {
        await that.getCodeParmas()
        .then(res => {
          console.log('Promise_result', res)
          if(res.data.code == 0) {
            that.data.level1 = res.data.data.level1
            that.data.level2 = res.data.data.level2
            that.data.exprId = res.data.data.exprId
            that.data.actionType = res.data.data.actType
            that.data.couponId = res.data.data.couponId
            that.data.codeType = res.data.data.codeType
            that.data.activeName = res.data.data.actId
          }
        })
        .then(() => {
          that.setData({
            level1: that.data.level1,
            level2: that.data.level2,
            exprId: that.data.exprId,
            actionType: that.data.actionType,
            couponId: that.data.couponId,
            codeType: that.data.codeType,
            activeName: that.data.activeName
          })
        })
        .catch(err => {
          console.error(err)
        });
        await that.getScanCodeImg();
      }
      asyncGetCodeParmasNew()
    } catch (error) {
      console.error(error)
    }
  },
  // 获取到店礼品二维码参数
  getCodeParmas: function() {
    // 请求包装返回Promise
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${env.pc}/add_cart/?step=getSaleappInfo&user_id=${this.data.userId}`,
        method: 'GET',
        dataType: 'json',
        success: resolve,
        error: reject
      })
    })
  },
  // 请求核销二维码
  getScanCodeImg: function() {
    // 判断环境
    env.pc.split('//')[1].split('.')[0] === 'test' ? this.data.mchId = '111' : this.data.mchId = '116'
    console.log(this.data.mchId)

    if(this.data.userName == null) {
      this.data.userName = '',
      this.setData({
        userName : this.data.userName
      })
    }
    // 请求二维码图片
    wx.request({
      url: `${env.baseUrl}qr/tempcode/saleappQrcode?mchId=${this.data.mchId}&userName=${this.data.userName}&exprId=${this.data.exprId}&level1=${this.data.level1}&level2=${this.data.level2}&actionType=${this.data.actionType}&activeName=${this.data.activeName}`,
      method: 'GET',
      dataType: 'json',
      success: (res) => {
        // console.log(`${env.baseUrl}qr/tempcode/saleappQrcode?mchId=${this.data.mchId}&userName=${this.data.userName}&exprId=${this.data.exprId}&level1=${this.data.level1}&level2=${this.data.level2}&actionType=${this.data.actionType}&activeName=${this.data.activeName}`)
        if( res.data.error == 0 ) {
          this.data.scanCodeImgUrl = res.data.msg;
          this.setData({
            scanCodeImgUrl: this.data.scanCodeImgUrl
          })
        }
      }
    })
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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

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
    return app.globalData.shareInfo
  }
})