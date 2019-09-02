// miniprogram/pages/result/result.js
const { appName }  = require('../../config/config.js')
const quick = require('../../utils/quick.js')
const util = require('../../utils/util.js')
const business = require('../../utils/business.js')
const { shareResultLangs } = require('../../utils/langs.js')
const { router } = require('../../utils/router.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    roomUuid: '',
    layoutUuid: '',
    layoutPicUrl: '',  //结果图片
    layoutPicUrlLocal: '',  //本地结果图片
    canvasWidth: '',
    minaDesc: '',
    randomStr: '',
    drawLogoConfig: {
      logoUrl: '/images/icon-logo.png',
      logoWidth: 47,
      logoHeight: 47,
    },
    logoUrl: '/images/icon-logo.png',
    drawHeadBgConfig:{
      headBgUrl: '/images/bg-poster-head.png',
      headBgWidth: 451,
      headBgHeight: 100,
    },
    qrCodeUrl: '',  //小程序二维码
    qrCodeUrlLocal: '',
    qrCodeWidth: 170,
    factor: '', //屏幕比例和750比较
    showModal: '',
    posterLeft: -999,  //海报x轴坐标
    isShowModalGetUserInfo: false,  //是否显示信息采集框
    isShowModalShare: false,  //是否显示分享弹框
    isShowModalTips: false, //是否显示已提交信息弹框
    isShareScene: 0,  //是否分享出去点进来的页面,1:是
    resultBtnTxt: '给朋友分享我的设计',
    gotoGoodsBtnTxt: '我选的产品实拍图',
    appointDesignerBtnTxt: '免费获取装修设计',
    posterImgFactor: '',//海报图片长宽比
  },

  getUserLayoutByUuid(){
    let formData = {
      layoutUuid: this.data.layoutUuid
    }
    quick.requestGet({ url: 'getUserLayoutByUuid' }, formData).then((res) => {
      const { code, data } = res.data;
      if (code === 0) {
        this.setData({
          layoutPicUrl: data.layoutPicUrl,
          roomUuid: data.roomUuid
        })
        this.getImageInfo(this.data.layoutPicUrl, 'layoutPicUrlLocal')
      }
    })
  },

  //获取小程序二维码
  getMinaQrCode(){
    let formData = {
      appId: app.globalData.appId,
      scene: 99,
      page: 'pages/index/index',
      width: this.data.qrCodeWidth,
    }
    quick.requestGet({ url: 'getMinaQrCode' }, formData).then((res) => {
      const { code, data } = res.data;
      if (code === 0) {
        this.setData({
          qrCodeUrl: data.qrCodeUrl
        })
        this.drawPoster()
        this.getImageInfo(this.data.qrCodeUrl, 'qrCodeUrlLocal', this.drawPoster)
      }
    })
  },

  //获取随机文案
  getShareDescWords(){
    let formData = {
      layoutUuid: this.data.layoutUuid
    }
    quick.requestGet({ url: 'getShareDescWords' }, formData).then((res) => {
      const { code, data } = res.data;
      if (code === 0) { 
        this.setData({
          randomStr: data.shareWord
        })
      }
    })
  },

  //显示信息采集框
  toggleModalGetUserInfo(){
    business.getUserInfo(app).then(res =>{
      if (res != 1){
        this.toggleModalTips()
      }else{
        this.setData({
          isShowModalGetUserInfo: true
        })
      }
    })
  },
  toggleModalTips(){
    this.setData({
      isShowModalTips: !this.data.isShowModalTips
    })
  },
  //关闭信息采集弹框
  closeModalGetUserInfo(){
    this.setData({
      isShowModalGetUserInfo: false
    })
  },

  //切换分享弹框
  toggleModalShare(){
    if(this.data.isShareScene == 1){
      wx.navigateTo({
        url: router('game'),
      })
    }else{
      this.setData({
        isShowModalShare: !this.data.isShowModalShare
      })
    }
  },

  //显示海报弹框
  showPoster(){
    this.setData({
      posterLeft: 0,
    })
    console.log('this.data.showModal' + this.data.showModal)
  },

  //关闭海报
  closePoster(){
    this.setData({
      posterLeft: -999,
    })
  },

  //生成海报
  proPoster(){
    this.pushMsg('save');
    this.getMinaQrCode();
  },

  //设置画布宽度
  setCanvasWidth(){
    util.getDomInfoById('#poster').then(res => {
      util.getSystemInfoAsync().then(sysRes => {
        console.log('windowWidth:', sysRes.windowWidth,  sysRes.windowWidth / 2)
        this.setData({
          canvasWidth: sysRes.windowWidth <=320 ? res.width + 1 : res.width,
          // canvasWidth: res.width
        })
      })
    })
  },

  getImageInfo(url,localField, callback) {    //  图片缓存本地的方法
    if (typeof url === 'string') {
      wx.getImageInfo({   //  小程序获取图片信息API
        src: url,
        success: (res) =>{
          this.setData({
            [localField]: res.path
          })
          if (localField == 'layoutPicUrlLocal'){
            this.setData({
              posterImgFactor: res.height/res.width
            })
          }
          if (typeof (callback) == 'function') {
            callback();
          }
        },
        fail(err) {
          console.log(err)
        }
      })
    }
  },

  toPx(rpx) {    // rpx转px
    return rpx * this.data.factor;
  },

  //绘制海报
  drawPoster(){
    const { layoutPicUrl, layoutPicUrlLocal, qrCodeUrl, qrCodeUrlLocal, drawLogoConfig, minaDesc, randomStr, drawHeadBgConfig } = this.data
    const ctx = wx.createCanvasContext('poster');
    ctx.clearRect(0, 0, 0, 0);
    ctx.setFillStyle('#fff')
    const posterImgHeight = this.toPx(650) * this.data.posterImgFactor;
    ctx.fillRect(0, 0, this.toPx(650), posterImgHeight+this.toPx(230)) //画白色背景
    const WIDTH = this.toPx(650);
    //const HEIGHT = this.toPx(815);
    const qrCodeWidth = this.toPx(this.data.qrCodeWidth)
    ctx.drawImage(layoutPicUrlLocal, 0, 0, this.data.canvasWidth, posterImgHeight);
    ctx.drawImage(drawLogoConfig.logoUrl, this.toPx(40), this.toPx(42), this.toPx(drawLogoConfig.logoWidth), this.toPx(drawLogoConfig.logoHeight));
    ctx.drawImage(drawHeadBgConfig.headBgUrl, this.toPx(95), this.toPx(31), this.toPx(drawHeadBgConfig.headBgWidth), this.toPx(drawHeadBgConfig.headBgHeight));
    ctx.drawImage(qrCodeUrlLocal, this.toPx(60), this.toPx(840), qrCodeWidth, qrCodeWidth);
    //文字背景
    //this.drawRect(ctx, this.toPx(282), this.toPx(870), this.toPx(296), this.toPx(44), '#181818')
    //this.drawRect(ctx, this.toPx(282), this.toPx(920), this.toPx(186), this.toPx(44), '#181818')
    this.drawLinesTxt(ctx, randomStr,28, "#333",126,75,392, false)
    ctx.setFontSize(this.toPx(26))
    ctx.setFillStyle('#fff')
    ctx.setFontSize(this.toPx(34))
    //ctx.fillText('测测你的审美值多少分', this.toPx(110), this.toPx(90))
    // this.drawText(ctx,
    //   {
    //     color: '#fff',
    //     size: this.toPx(34),
    //     bold: true,
    //     text: '测测你的审美值多少分',
    //     x: this.toPx(110),
    //     y: this.toPx(90),
    //   }
    // )
    //ctx.fillText('长按识别小程序', this.toPx(292), this.toPx(904))
    this.drawText(ctx, 
      { 
        color: '#333', 
        size: this.toPx(34), 
        bold: true, 
        text: '长按识别小程序', 
        x: this.toPx(282),
        y: this.toPx(904),
      }
    )
    this.drawText(ctx,
      {
        color: '#333',
        size: this.toPx(34),
        bold: true,
        text: '立即挑战',
        x: this.toPx(282),
        y: this.toPx(954),
      }
    )
    //ctx.fillText('立即挑战', this.toPx(292), this.toPx(954))
    ctx.setFillStyle('#999')
    //ctx.font = 'normal normal ' + this.toPx(22) + 'px sans-serif';
    ctx.setFontSize(this.toPx(22))
    ctx.fillText(`分享自美乐乐"${appName}"`, this.toPx(282), this.toPx(998))
    ctx.draw();
    this.showPoster()
  },

  drawText: function (ctx,obj) {
    ctx.setFillStyle(obj.color);
    ctx.setFontSize(obj.size);
    if (obj.bold) {
      ctx.fillText(obj.text, obj.x, obj.y - 0.3);
      ctx.fillText(obj.text, obj.x - 0.3, obj.y);
    }
    ctx.fillText(obj.text, obj.x, obj.y);
    if (obj.bold) {
      ctx.fillText(obj.text, obj.x, obj.y + 0.3);
      ctx.fillText(obj.text, obj.x + 0.3, obj.y);
    }
  },

  //画矩形
  drawRect(ctx, xPosition, yPosition, width, height, color){
    ctx.setFillStyle(color)
    ctx.fillRect(xPosition, yPosition, width, height)
  },


  //画两行文字
  drawLinesTxt(ctx,str,fontSize,fontColor, xPosition, yPosition, maxWidth, isBold){
    ctx.font = 'normal normal ' + this.toPx(fontSize) + 'px sans-serif';
    var chr = str.split("");
    var temp = "";
    var row = [];
    ctx.setFontSize(this.toPx(fontSize))
    ctx.setFillStyle(fontColor);
    for (var a = 0; a < chr.length; a++) {
      if (ctx.measureText(temp).width < this.toPx(maxWidth)) {
        temp += chr[a];
      }
      else {
        a--; //这里添加了a-- 是为了防止字符丢失
        row.push(temp);
        temp = "";
      }
    }
    row.push(temp);
    if (row.length > 2) {
      var rowCut = row.slice(0, 2);
      var rowPart = rowCut[1];
      var test = "";
      var empty = [];
      for (var a = 0; a < rowPart.length; a++) {
        if (ctx.measureText(test).width < this.toPx(maxWidth)) {
          test += rowPart[a];
        }
        else {
          break;
        }
      }
      empty.push(test);
      var group = empty[0] + "..."//这里只显示两行，超出的用...表示
      rowCut.splice(1, 1, group);
      row = rowCut;
    }
    for (var b = 0; b < row.length; b++) {
      if (isBold){
        ctx.fillText(row[b], this.toPx(xPosition), this.toPx(yPosition + b * (fontSize + 5))-0.3, this.toPx(maxWidth));
        ctx.fillText(row[b], this.toPx(xPosition)-0.4, this.toPx(yPosition + b * (fontSize + 5)), this.toPx(maxWidth));
        ctx.fillText(row[b], this.toPx(xPosition), this.toPx(yPosition + b * (fontSize + 5)) - 0.3, this.toPx(maxWidth));
        ctx.fillText(row[b], this.toPx(xPosition), this.toPx(yPosition + b * (fontSize + 5)) + 0.3, this.toPx(maxWidth));
        ctx.fillText(row[b], this.toPx(xPosition) + 0.4, this.toPx(yPosition + b * (fontSize + 5)), this.toPx(maxWidth));
      }else{
        ctx.fillText(row[b], this.toPx(xPosition), this.toPx(yPosition + b * (fontSize + 5)), this.toPx(maxWidth));
      }
    }
  },

  //设置屏幕比例
  setFactor(){
    util.getSystemInfoAsync().then(res =>{
      this.setData({
        factor: res.screenWidth / 750
      })
    })
  },

  //生成海报到本地
  savePosterToLocal(){
    wx.canvasToTempFilePath({
      canvasId: 'poster',
      fileType: 'jpg',
      success: function (res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success(res) {
            quick.showToastNone('保存成功');
          },
          fail(res) {
            quick.showToastNone('保存失败');
          }
        })
      }
    })
  },

  //设置结果分享配置
  setShareResultConfig(res){
    if (res.from === 'button') {
      wx.showShareMenu({
        success: function () {
          setTimeout(function () {
            quick.showToastNone('分享成功')
          }, 3000)
        }
      })
    }
    return {
      title: shareResultLangs,
      path: `/pages/result/result?layoutUuid=${this.data.layoutUuid}&isShareScene=1`,
      imageUrl: this.data.layoutPicUrl
    }
  },

  //推送模板消息
  pushMsg(pushType){
    let formData = {
      pushType: pushType,
      unionId: app.globalData.unionId
    }
    quick.requestPost({ url: 'pushMsg' }, formData).then((res) => {
      const { code, data } = res.data;
      if (code === 0) {
        
      }
    })
  },

  cancelMove(){

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { layoutUuid, isShareScene } = options
    this.setData({
      layoutUuid: layoutUuid,
      isShareScene: isShareScene || 0,
      resultBtnTxt: isShareScene ? '我也去搭配' :'给朋友分享我的设计',
      gotoGoodsBtnTxt: isShareScene ? '查看图中商品' : '我选的产品实拍图',
      appointDesignerBtnTxt: isShareScene ? '一键预约专属设计师' : '免费获取装修设计',
    })
    this.getUserLayoutByUuid()
    this.getShareDescWords()
    this.setFactor();
    this.setCanvasWidth()
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    business.addShare(app.globalData.openId)
    if (res.from === 'button'){
      this.pushMsg('share')
      return this.setShareResultConfig(res)
    }
    return business.setMinaShareConfig(app)
  }
})