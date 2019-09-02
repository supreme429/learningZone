// pages/scanCodeReceiving/index/index.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isOpenScan: false,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  onUnload: function() {
  },

  // 打开扫码
  // 扫码成功获取收货单号并根据单号查询收货人号码
  openScan() {
    let isOpenScan = this.data.isOpenScan;
    if (isOpenScan) return;
    this.data.isOpenScan = true;
    this.showLoading();
    app.setScenario('scanCode');
    setTimeout(() => {
      wx.scanCode({
        onlyFromCamera: true,
        success: res => {
          console.log('扫码结果：', res);
          // 读取收货单号
          this.getConsigneePhone(res.result.split(',')[1]);
        },
        fail: err => {
          console.log('扫码失败：', err);
          this.hideLoading();
          this.toastScanFail();
        },
        complete: () => {
          app.setScenario('');
        }
      })
    }, 200)
    
  },
  
  showLoading() {
    wx.showLoading({
      title: '扫码中，请稍等',
      success() {
        console.log('showLoading')
      }
    })
  },

  hideLoading() {
    setTimeout(() => {
      console.log('hideLoading')
      wx.hideLoading();
      this.data.isOpenScan = false;
    }, 500)
  },

  // 请求获取收货人号码
  getConsigneePhone(deliveryNo) {
    this.showLoading();
    app.requestGet({url: 'getOrderPhone'}, {
      deliveryNo: deliveryNo,
      openId: app.globalData.openId
    }).then((res) => {
      console.log('getOrderPhone成功！')
      if(res.data.code === 0) {

        const data = res.data.data;
        const scanCodeRecevingInfo = app.globalData.scanCodeRecevingInfo;
        const wxPhone = app.globalData.wxPhone;

        wx.setStorage({ key: 'deliveryNo', data: deliveryNo });
        wx.setStorage({ key: 'consigneePhone', data: data.phone });
        wx.setStorage({ key: 'consigneePhoneBak', data: data.phoneBak });
        wx.setStorage({ key: 'evaluateStatus', data: 0 });

        scanCodeRecevingInfo.consigneePhone = data.phone;
        scanCodeRecevingInfo.consigneePhoneBak = data.phoneBak;
        scanCodeRecevingInfo.deliveryNo = deliveryNo;
        console.log('后台返回phone:', data.phone, '后台返回phoneBak:', data.phoneBak, 'wxPhone:', wxPhone)
        console.log('备用人手机号码收货判断逻辑：', !!wxPhone && (wxPhone === scanCodeRecevingInfo.consigneePhone || wxPhone === scanCodeRecevingInfo.consigneePhoneBak))
        
        if (parseInt(data.isNeedAuth) === 1) { //isNeedAuth  1 无需授权   0 需授权
          wx.navigateTo({ // 6小时内授权有效，无需重新授权
            url: '/pages/scanCodeReceiving/signIn/signIn',
          })
        }else if (!wxPhone) { // 缓存中没有微信手机号，跳转到登录页面【首次打开扫码】
          wx.navigateTo({
            url: '/pages/scanCodeReceiving/login/login',
          })
        } else if (!!wxPhone && (wxPhone === scanCodeRecevingInfo.consigneePhone || wxPhone === scanCodeRecevingInfo.consigneePhoneBak)) {
          wx.navigateTo({ // 缓存中有微信手机号，且与收货手机号或备用手机一致跳转到签收页面
            url: '/pages/scanCodeReceiving/signIn/signIn',
          })
        } else if (!!wxPhone && wxPhone !== scanCodeRecevingInfo.consigneePhone) {
          wx.navigateTo({ // 缓存中有微信手机号，但与收货手机号不一致跳转到签收授权页面
            url: '/pages/scanCodeReceiving/receivingPower/receivingPower',
          })
        } else {
          this.toastScanFail();
        }
      } else {
        this.toastScanFail();
      }
      this.hideLoading();
    }).catch(err => {
      console.log('接口调用失败：', err);
    })
  },

  // 扫码失败提示
  toastScanFail() {
    wx.showToast({
      title: '扫描失败，请重试！',
      icon: 'none'
    })
  }
})