// pages/confirm-order/confirm-order.js
const $ = global;
const app = getApp();
const requestPrefix = app.globalData.domain;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    deliverIndex:{},//所有商品所选快递方式序列
    remarkOBJ:{},//所有店铺的留言
    goodsInfo:{},
    shops_fee:{},  //店铺运费
    total_fee:0,
    goodsParams:[],//提交订单中的goods参数
    rec_arr:[],
    flags:false,
    addressText:'正在获取地址...',
    imagesUrl: app.globalData.imagesUrl,
    orderStatus:''//判断是否创建了订单
  },
  goodsDetail:function(e){//到商品详情页
    let goods_id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../goods/goods?goods_id=' + goods_id,
    })
  },
  addReceiverAddress:function(){//增加收货地址or设置默认地址
    let goodsInfo = this.data.goodsInfo
    if (goodsInfo.no_default_address && goodsInfo.no_default_address == 1){
      wx.navigateTo({
        url: '../address/list/list?types=FromOrder',
      })
    }else{
      wx.navigateTo({
        url: '../address/addEdit/addEdit?types=FromOrder',
      })
    }
  },
  editorAddress:function(){//修改&更换地址
    wx.navigateTo({
      url: '../address/list/list?types=FromOrder',
    })
  },
  deliverystyle:function(e){//快递方式
    console.log('配送方式',e)
    let goodsInfo = this.data.goodsInfo;
    let dataset = e.currentTarget.dataset;
    let deliverIndex = this.data.deliverIndex;
    let value = e.detail.value
    console.log(deliverIndex)
    deliverIndex[dataset.id].index = value;
    for (var i in goodsInfo.shopList){//选择配送方式后重新计算运费
      if (goodsInfo.shopList[i].shop_id == dataset.shopid){
        for (var j in goodsInfo.shopList[i].goods.list){
          if (goodsInfo.shopList[i].goods.list[j].goods_id == dataset.id){
            goodsInfo.shopList[i].goods.list[j].deliveryTypeId = goodsInfo.shopList[i].goods.list[j].Final_Option_Ship[value].shipType
          }
        }
      }
    }
    console.log('goodsInfo',goodsInfo)
    this.countFreight(goodsInfo)
    this.setData({
      deliverIndex: deliverIndex,
      goodsInfo: goodsInfo
    })
  },
  shopsRemark:function(e){//留言
    let remarkOBJ = this.data.remarkOBJ;
    let shopsid = e.currentTarget.dataset.id;
    remarkOBJ[shopsid].cusComment = e.detail.value;
    this.setData({
      remarkOBJ: remarkOBJ
    })
  },
  submitOrder:function(){
    let that = this
    //创建订单&支付
    let goodsInfo = this.data.goodsInfo;
    let goodsParams = this.data.goodsParams;
    let remarkOBJ = this.data.remarkOBJ;
    let total_fee = this.data.total_fee || 0
    let bonus = {}, coupons = {}, coin = {}, lecoin = {};
    if (!goodsInfo.address) {
      wx.showToast({
        'title': '请先添加收货地址!',
        'icon': 'none'
      })
      return
    }
    wx.showLoading({
      title: '提交中',
    })
    for (var i in goodsInfo.shopList){
      bonus[goodsInfo.shopList[i].shop_id] = 0;
      coupons[goodsInfo.shopList[i].shop_id] = '';
      coin[goodsInfo.shopList[i].shop_id] = 0;
      lecoin[goodsInfo.shopList[i].shop_id] = 0;
    }
    let params = {
      'submitGoodsPack':{
        'addressId': goodsInfo.address.address_id,
        'exprId':'',
        'address': { "expr": goodsInfo.address.expr},
        'bonus': bonus,
        'coupons': coupons,
        'coin': coin,
        'lecoin': lecoin,
        'goods': goodsParams,
        'shopData': remarkOBJ,
        'amount': total_fee + goodsInfo.total,
        'act_id':'0',
        'validResubmit':'',
        'valid_front_forbid':'',
        'add_system':'',
        'expr_normal_user_detail':{
          'expr_normal_user_name':'',
          'expr_normal_user_mobile':''
        }
      },
      'from':'4'
    }
    params.submitGoodsPack = JSON.stringify(params.submitGoodsPack)
    console.log(params)
    $.ajax({
      url: $.config.REQUEST_URL +'add_cart/?step=submitOrder',
      header: {
        "content-Type": "application/x-www-form-urlencoded"
      },
      method: 'post',
      data: params,
      success:function(res){
        wx.hideLoading()
        console.log('提交订单',res)
        if (res.data.error !=0){
          wx.showToast({
            'title': '订单提交失败!',
            'icon':'none'
          })
          return
        }
        let orderSn = '', userId = wx.getStorageSync('user_id'), openid = wx.getStorageSync('openid');
        for (var i in res.data.orderSnAmount){
          orderSn = orderSn + res.data.orderSnAmount[i].orderSn+','
        }
        orderSn = orderSn.substr(0, orderSn.length-1)
        $.ajax({
          url: $.config.REQUEST_URL +'dubbo_api/paymentService/paymentRestService/miniAppPrePay',
          header: {
            "content-Type": "application/x-www-form-urlencoded"
          },
          method: 'post',
          data:{
            orderSn: orderSn,
            userId: userId,
            openid: openid,
            totalFee: Number(total_fee + goodsInfo.total),
            isPart:'0'
          },
          success:function(msg){
            that.setData({
              orderStatus:true
            })
            console.log('支付',msg)
            if (msg.data.error == 0){
              //支付
              wx.requestPayment({
                "timeStamp": msg.data.data.timeStamp,
                "nonceStr": msg.data.data.nonceStr,
                "package": msg.data.data.package,
                "signType": msg.data.data.signType,
                "paySign": msg.data.data.paySign,
                success(ress) { 
                  wx.redirectTo({
                    url: '../order/detail/detail?orderSn=' + orderSn,
                  })
                },
                fail(err) { 
                  wx.redirectTo({
                    url: '../order/detail/detail?orderSn=' + orderSn,
                  })
                }
              })
              
            }
          }
        })
      }
    })
  },
  countFreight:function(obj){
    console.log('计算运费',obj)
    //计算运费
    let that = this
    let goodsParams = [] //提交订单需要的goos参数
    let freight = {}
    let allGoodsObj = {}
    for (var i in obj.shopList) {
      let goodsArr = []
      let shops_id = obj.shopList[i].shop_id
      for (var j in obj.shopList[i].goods.list) {
        var goodsObj = {
          actId: obj.shopList[i].goods.list[j].activity_id || 0,
          is_act: '0',
          auction_id: '0',
          goodsActivityId: obj.shopList[i].goods.list[j].goods_act_id || 0,
          goodsId: obj.shopList[i].goods.list[j].goods_id,
          goodsNumber: obj.shopList[i].goods.list[j].goods_number,
          goods_price: obj.shopList[i].goods.list[j].EffectPrice,
          goods_type: obj.shopList[i].goods.list[j].goods_type.join(','),
          id:parseInt(j)+1,
          payType: '',
          recId: obj.shopList[i].goods.list[j].rec_id,
          services: '',
          shipType: obj.shopList[i].goods.list[j].deliveryTypeId,
          shopId: obj.shopList[i].goods.list[j].shop_id,
          goods_act_type: ''
        }
        goodsArr.push(goodsObj)
        goodsParams.push(goodsObj)
      }
      allGoodsObj[shops_id] = {
        'goods': goodsArr
      }
    }
    that.setData({
      'goodsParams': goodsParams
    })
    console.log(allGoodsObj)
    for (var s in obj.address) {//地址参数
      let addr = ''
      addr = 'address[' + s + ']'
      freight[addr] = obj.address[s]
    }
    freight.goods = JSON.stringify(allGoodsObj)
    $.ajax({
      url: $.config.REQUEST_URL + 'core_api/Order/apiserviceFee/',
      header: {
        "content-Type": "application/x-www-form-urlencoded"
      },
      method: 'post',
      data: freight,
      success: function (msg) {
        let flags = that.data.flags
        let shops_feeObj = {}
        let total_fee = 0;
        for (var i in msg.data.shipfee) {
          shops_feeObj[i] = Number(msg.data.shipfee[i].Ship_fee + msg.data.shipfee[i].Order_fix_fee) 
          total_fee = total_fee + shops_feeObj[i]
        }
        console.log('运费', shops_feeObj)
        that.setData({
          shops_fee: shops_feeObj,
          total_fee: Number(total_fee),
          flags:true
        })
      }
    })
  },
  returnTap:function(){},
  getOrderDetails: function (params, recId){
    //获取购买物品，地址信息
    wx.showLoading({
      title: '加载中...',
    })
    let that = this;
    $.ajax({
      url: requestPrefix+'/order/flow/confirm/?iVersion=1.0',
      data: params,
      success: function (res) {
        let datas = res.data.data
        let deliverIndex = {}  //初始化所有商品配送方式
        let remarkOBJ = {} //初始化所有店铺的留言
        let addressText = that.data.addressText
        if (datas.address){
          addressText = datas.address.province_name + datas.address.city_name + datas.address.district_name + datas.address.address
        } else if (datas.no_default_address && datas.no_default_address ==1){
          addressText = '点击，设置您的默认地址'
        }else{
          addressText = '你还没有收货地址,点击新增收货地址'
        }
        console.log(datas)
        for (var i = 0; i < datas.shopList.length; i++) {
          if (!datas.shopList[i].shop_id) {
            datas.shopList.splice(i, 1)
          }
          remarkOBJ[datas.shopList[i].shop_id] = {
            'cusComment': '',
            'delayDays': '',
            'shopActId': '0',
            'shopId': datas.shopList[i].shop_id
          }
          for (var j in datas.shopList[i].shipType) {//服务方式
            if (datas.shopList[i].shipType[j].default == 1) {
              datas.shopList[i].server = datas.shopList[i].shipType[j]
            }
          }
          for (var m in datas.shopList[i].goods.list) {//每种商品的快递方式
            recId = recId.join(',')
            if (recId.indexOf(datas.shopList[i].goods.list[m].rec_id) == -1) {
              //排除rec_id不符的商品
              datas.shopList[i].goods.list.splice(m, 1)
            }
            var deliveryArr = []
            var deliverObj = {
              'goodsId': datas.shopList[i].goods.list[m].goods_id,
              'index': 0
            }
            deliverIndex[datas.shopList[i].goods.list[m].goods_id] = deliverObj
            for (var n in datas.shopList[i].goods.list[m].Final_Option_Ship) {
              
              if (!datas.shopList[i].goods.list[m].Final_Option_Ship[n].isSelected) {//暂时取默认配送方式。否则去掉这个条件
                datas.shopList[i].goods.list[m].Final_Option_Ship.splice(n,1)
              }
              if (datas.shopList[i].goods.list[m].Final_Option_Ship[n].isSelected) {
                //暂时取默认配送方式，否则放到条件外边
                deliveryArr.push(datas.shopList[i].goods.list[m].Final_Option_Ship[n].shipTypeName)
                //默认配送方式
                deliverIndex[datas.shopList[i].goods.list[m].goods_id].index = n;
                //设置默认配送方式id
                datas.shopList[i].goods.list[m].deliveryTypeId = datas.shopList[i].goods.list[m].Final_Option_Ship[n].shipType;
              }
              datas.shopList[i].goods.list[m].deliveryArr = deliveryArr
            }

          }
        }
        //计算运费
        that.countFreight(datas)
        that.setData({
          'goodsInfo': datas,
          'deliverIndex': deliverIndex,
          'remarkOBJ': remarkOBJ,
          'addressText': addressText
        })
        wx.hideLoading()
      },
      fail:function(){
        wx.hideLoading()
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('订单参数',options)
    let rec_arr = options.rec.split(',');
    let arr = []
    let params = {}
    let recId = []
    for (let i in rec_arr){
      let m = ''
      rec_arr[i] = rec_arr[i].split(':')
      m = 'rec_id[' + rec_arr[i][1]+']'
      params[m] = rec_arr[i][1]
      recId.push(rec_arr[i][1])
    }
    this.setData({
      rec_arr: rec_arr
    })
    this.getOrderDetails(params, recId)
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
    console.log(this.data.rec_arr)
    let rec_arr = this.data.rec_arr
    let arr = []
    let params = {}
    let recId = []
    for (let i in rec_arr) {
      let m = ''
      m = 'rec_id[' + rec_arr[i][1] + ']'
      params[m] = rec_arr[i][1]
      recId.push(rec_arr[i][1])
    }
    if (!this.data.orderStatus){
      this.getOrderDetails(params, recId)
    }
    
    // 调用跟踪代码
    $.track.push(['trackView']);
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
  
})