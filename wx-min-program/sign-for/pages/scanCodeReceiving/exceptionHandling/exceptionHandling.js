// pages/scanCodeReceiving/exceptionHandling/exceptionHandling.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsId: "",
    orderId: '',  //订单id
    orderSn: '', //订单号
    consignee: '', // 收货人
    goodsName: "",//商品名称
    goodsUrl: "",//商品链接
    goodsTotalNum: 0,//商品总数量
    goodsNum: 0,//商品问题数量
    allProblemList: [],
    problemList: [],
    problemDesc: "",
    problemPicUrl: [],//
    needAfterSale: 1,//0不需要，1需要
    textAreaLength: 0,//textarea长度
    errorTip: "",
    errorShow: false,
    bigSrc: {
      showBigImg: false,
      tempBigSrc: "",//显示大图
    },
  },
  /**
   * 减少数量
   */
  delNum: function () {
    this.setData({
      goodsNum: this.data.goodsNum > 0 ? this.data.goodsNum - 1 : 0
    })
  },
  /**
   * 添加数量
   */
  addNum: function () {

    if (this.data.goodsNum >= this.data.goodsTotalNum) {
      wx.showToast({
        title: '问题商品数量不能大于商品数量',
        icon: 'none'
      })
      return;
    }

    this.setData({
      goodsNum: parseInt(this.data.goodsNum) + 1
    })
  },
  /**
   * 修改数量
   */
  changeNum: function (e) {
    let goodsNum = e.detail.value;
    if (e.detail.value > this.data.goodsTotalNum) {
      goodsNum = this.data.goodsTotalNum;
      wx.showToast({
        title: '问题商品数量不能大于商品数量',
        icon: 'none',
      })
    }
    this.setData({
      goodsNum: goodsNum
    });
  },
  /**
   * 修改选中的问题
   */
  changeProblem: function (e) {
    const { id, reason, idx } = e.currentTarget.dataset;
    const isSelected = this.data.allProblemList[idx].isSelected = !this.data.allProblemList[idx].isSelected;

    if (!isSelected) {
      this.data.problemList.find((o, index) => {
        
        if(o.id === id) {
          this.data.problemList.splice(index, 1);
          return true;
        }
      })
    } else {
      const tempObject = {
        id: id,
        reason_name: reason
      };

      this.data.problemList.push(tempObject);
    }

    this.setData({
      problemList: this.data.problemList,
      allProblemList: this.data.allProblemList
    })
  },
  /**
   * 获取TextAreaLength
   */
  getTextAreaLength: function (e) {
    const len = parseInt(e.detail.value.length);
    if (len > 500) {
      wx.showToast({
        title: '不能超过500字',
        icon: 'none',
        duration: 3000
      })
    } else {
      this.setData({
        textAreaLength: len,
        problemDesc: e.detail.value
      });
    }
  },
  /**
   * 删除图片
   */
  delProblemPic: function (e) {
    var url = e.currentTarget.dataset.src;
    var idx = e.currentTarget.dataset.index;
    var picUelList = this.data.problemPicUrl;
    if (picUelList.length > 0) {
      for (var i = 0; i < picUelList.length; i++) {
        if (i == idx && url == picUelList[i]) {
          picUelList.splice(i, 1);
        }
      }
      this.setData({
        problemPicUrl: picUelList
      });
    }
  },

  /**
   * 获取本地图片
   */
  getCamara: function () {
    var self = this;
    app.setScenario('chooseFile');
    wx.chooseImage({
      count: 8 - this.data.problemPicUrl.length,
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: res => {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        const tempUrl = res.tempFilePaths,
              len = tempUrl.length,
              tempPaths = [];

        wx.showLoading({
          title: '上传中...',
        })

        for (var i = 0; i < len; i++) {
          wx.uploadFile({
            url: app.getRequestUrl('up/ntpl/upload', 'signmina'), //仅为示例，非真实的接口地址
            filePath: tempUrl[i],
            name: 'file',
            formData: {},
            success: res => {
              const data = JSON.parse(res.data);
              if (data.status === 'success') {
                tempPaths.push(data.url);
                this.data.problemPicUrl.push(data.url);
                this.setData({
                  problemPicUrl: self.data.problemPicUrl
                });

                if (tempPaths.length === len) {
                  wx.hideLoading()
                }
              } else {
                wx.showToast({
                  title: '上传失败',
                  icon: 'none'
                })
                wx.hideLoading()
              }
            },
            fail: err => {
              wx.showToast({
                title: '上传失败',
                icon: 'none'
              })
              wx.hideLoading()
            }
          })
        }
      },
      complete: () => {
        app.setScenario('');
      }
    })
  },
  /**
   * 是否需要售后
   */
  isNeedAfterSale: function (e) {
    var idx = e.currentTarget.dataset.index;
    this.setData({
      needAfterSale: idx
    });
  },
  // 检测请求信息完整
  beforeSubmit() {
    // 检测问题商品数量
    if (!this.data.goodsNum) {
      wx.showToast({
        title: '请填写问题商量品数量',
        icon: 'none'
      })
      return false;
    }
    // 检测问题描述
    if (this.data.problemList.length === 0 && this.data.problemDesc.length === 0) {
      wx.showToast({
        title: '请选择或填写问题描述',
        icon: 'none'
      })
      return false;
    }
    // 检测问题图片
    if (this.data.problemPicUrl.length === 0) {
      wx.showToast({
        title: '请上传图片',
        icon: 'none'
      })
      return false;
    }

    return true;
  },
  /**
   * 提交发送请求
   */
  abnormalSign: function () {
    if (!this.beforeSubmit()) return;
    var self = this;
    var requectUrl = {
      url: 'abnormalSign',
    }
    var abnormalSignVo = {
      "unionId": app.globalData.unionId,
      "deliveryNo": app.globalData.scanCodeRecevingInfo.deliveryNo,
      "orderId": self.data.orderId,
      "orderSn": self.data.orderSn,
      "goodsId": self.data.goodsId,
      "goodsName": self.data.goodsName,
      "goodsNum": self.data.goodsNum,
      "goodsSn": self.data.goodsSn,
      "needAfterSale": self.data.needAfterSale,
      "orderId": self.data.orderId,
      "orderSn": self.data.orderSn,
      "problemDesc": self.data.problemDesc,
      "problemList": self.data.problemList,
      "problemPicUrl": self.data.problemPicUrl,
      "signOpenId": app.globalData.openId,
      "signPhone": app.globalData.wxPhone,
      "recId": self.data.recId,
    };
    app.requestPost(requectUrl, abnormalSignVo).then(function (res) {
        if (res.data.code === 0) {
          var tempData = JSON.parse(res.data.data);
          if (tempData.isSign == 1) {
            wx.navigateTo({
              url: '../signIn/signIn',
            })
          } else if (tempData.isSign == 0) {
            wx.navigateTo({
              url: '../serviceEvaluation/serviceEvaluation?consignee=' + self.data.consignee + '&orderId=' + self.data.orderId + '&orderSn=' + self.data.orderSn
            })
          }
          
        } else {
          app.requestErrorToast('收货反馈提交失败');
        }
    }).catch(function () {
      app.requestErrorToast('收货反馈提交失败');
    });
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
      if (res.data.code === 0) {
        if (res.data.data != null) {
          var tempData = JSON.parse(res.data.data);
          self.setData({
            goodsName: tempData.goodsName,
            goodsTotalNum: tempData.goodsNum,
            goodsUrl: tempData.goodsUrl,
            orderId: tempData.orderId,
            orderSn: tempData.orderSn,
            recId: tempData.recId,
            goodsSn: tempData.goodsSn,
          });
          console.log(tempData);
        }
      } else {
        app.requestErrorToast();
      }
    })
  },
  /**
   * 获取所有的问题描述
   */
  getProblemDesc: function () {
    var self = this;
    var requectUrl = {
      url: 'getProblemDesc',
    }
    var data = {
      deliveryNo: app.globalData.scanCodeRecevingInfo.deliveryNo,
      goodsId: self.data.goodsId,
      recId: self.data.recId
    };
    app.requestGet(requectUrl, data).then(function (res) {
      const code = res.data.code;
      if (code === 0) {
        const tempData = JSON.parse(res.data.data);
        for (var i = 0; i < tempData.length; i++) {
          var tempVo = Object.assign({ isSelected: false }, tempData[i]);
          self.data.allProblemList.push(tempVo);
        }
        self.setData({
          allProblemList: self.data.allProblemList,
        });
      } else {
        app.requestErrorToast();
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      goodsId: options.goodsId || '',
      orderId: options.orderId || '',
      orderSn: options.orderSn || '',
      consignee: options.consignee || '',
      recId: options.recId || ''
    })
    this.getProblemDesc();
    this.getGoodsInfo();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.jumpScanCodeIndex();
  },
})