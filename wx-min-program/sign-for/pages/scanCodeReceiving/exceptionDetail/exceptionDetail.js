// pages/scanCodeReceiving/exceptionDetail/exceptionDetail.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsId: "",
    goodsName: "",//商品名称
    goodsUrl: "",//商品链接
    goodsTotalNum: 0,//商品总数量
    goodsNum: 0,//商品问题数量
    problemList: [],
    problemDesc: "",
    problemPicUrl: [],//
    needAfterSale: 0,//0不需要，1需要
    afterSaleExplain:"",
    bigSrc: {
      showBigImg: false,
      tempBigSrc: "",//显示大图
    },
  },
  /**
    * 查询商品信息
    */
  getGoodsInfo: function () {
    var self = this;
    var requectUrl = {
      url: 'getGoodsInfo',
    }
    var data = {
      deliveryNo: app.globalData.scanCodeRecevingInfo.deliveryNo,
      goodsId: self.data.goodsId,
      recId: self.data.recId
    };
    app.requestGet(requectUrl, data).then(function (res) {
      if (res.data.code == "0") {
        if (res.data.data != null) {
          var tempData = JSON.parse(res.data.data);
          self.setData({
            goodsName: tempData.goodsName,
            goodsTotalNum: tempData.goodsNum,
            goodsUrl: tempData.goodsUrl,
          });
          console.log(tempData);
        }
      }
    })
  },
  /**
   * 获取签收信息
   */
  getAbnormalSignInfo:function(){
    var self = this;
    var requectUrl = {
      url: 'getAbnormalSignInfo',
    }
    var data = {
      deliveryNo: app.globalData.scanCodeRecevingInfo.deliveryNo,
      signOpenId: app.globalData.openId,
      goodsId: self.data.goodsId,
      recId: self.data.recId
    };
    app.requestGet(requectUrl, data).then(function (res) {
      if (res.data.code == "0") {
        if (res.data.data != null) {
          var tempData = JSON.parse(res.data.data);
          self.setData({
            needAfterSale: tempData.needAfterSale,
            problemDesc: tempData.problemDesc,
            goodsNum: tempData.goodsNum,
            problemList: JSON.parse(tempData.problemList),
            problemPicUrl: tempData.problemPicUrl,
            afterSaleExplain: tempData.afterSaleExplain,
          });
        
          console.log(tempData);
        }
      }
    })
  },
  /**
  * 显示大图
  */
  showBigPic: function (e) {
    let tempSrc = e.target.dataset.src;
    this.setData({
      bigSrc: {
        showBigImg: !this.data.bigSrc.showBigImg,
        tempBigSrc: tempSrc
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    self.setData({
      goodsId: options.goodsId || '',
      recId: options.recId || ''
    })
    self.getGoodsInfo();
    self.getAbnormalSignInfo();

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.jumpScanCodeIndex();
  },
})