// pages/evaluate/evaluate.js
const $ = global;
const app = getApp();
const requestPrefix = app.globalData.domain;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabArr:[
      {
        val:"待评价",
        active:true,
        arr:[],
        page:1
      },
      {
        val: "已评价",
        active:false,
        arr:[],
        page: 1
      },
    ],
    currentStatus:'0',
    login_status:true
  },
  /**
     * 商品预览
    **/
  previewGoods:function(e){
    console.log(e)
    let url = e.currentTarget.dataset.url
    let url_list = []
    url_list.push(url)
    wx.previewImage({
      current: url, // 当前显示图片的http链接
      urls: url_list // 需要预览的图片http链接列表
    })
  },
  /**
     * 图片预览
    **/
  previewImage: function (e) {
    
    // let url = e.currentTarget.dataset.url
    let current = e.currentTarget.dataset.current
    let index = e.currentTarget.dataset.index
    let currentStatus = this.data.currentStatus
    let tabArr = this.data.tabArr
    // let url_list = tabArr[currentStatus].arr[index].img_list
    let url_list = tabArr[currentStatus].arr[index].original_img_list //原图
    let url = url_list[current]
    console.log(url_list)
    let img_arr = []
    for (var i in url_list) {
      img_arr.push('https:' + url_list[i])
    }
    wx.previewImage({
      current: url, // 当前显示图片的http链接
      urls: img_arr //img_arr // 需要预览的图片http链接列表
    })
  },
  refreshData(){//登录出错刷新
    this.getOrderList()
  }, 
  setGrade(e){//打分
    let currentStatus = this.data.currentStatus
    let tabArr = this.data.tabArr
    let index = e.currentTarget.dataset.index
    let m = e.currentTarget.dataset.i
    for(var i = 0;i<5;i++){
      if (i<=m){
        tabArr[currentStatus].arr[index].star_arr[i] = true;
      }
      else{
        tabArr[currentStatus].arr[index].star_arr[i] = false
      }
    }
    tabArr[currentStatus].arr[index].grade = m+1;
    console.log(tabArr[currentStatus].arr[index])
    this.setData({
      tabArr: tabArr
    })
  },
  getEvaluteText(e){//获取评价内容
    let index = e.currentTarget.dataset.index
    let value = e.detail.value
    let currentStatus = this.data.currentStatus
    let tabArr = this.data.tabArr
    tabArr[currentStatus].arr[index].content = value
    this.setData({
      tabArr: tabArr
    })
  },
  upLoadImg(e){//上传图片
    console.log(e)
    let that = this
    let currentStatus = this.data.currentStatus
    let tabArr = this.data.tabArr
    let index = e.currentTarget.dataset.index
    if (tabArr[currentStatus].arr[index].imgUrl_list.length>=5){
      wx.showToast({
        title: '最多只能上传5张哦!',
        icon:'none'
      })
      return
    }
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        wx.showLoading({
          title: '上传中...',
        })
        const tempFilePaths = res.tempFilePaths
        console.log(tempFilePaths)
        wx.uploadFile({
          url: app.globalData.Login_url +'attach_upload/?model=1', 
          filePath: tempFilePaths[0],
          name: 'file',
          success(msg) {
            wx.hideLoading()
            console.log(msg)
            const data = msg.data
            let imgUrl = '//image.meilele.com/'+msg.data.split('("')[1].split('")')[0]
            console.log(imgUrl)
            tabArr[currentStatus].arr[index].imgUrl_list.push(imgUrl)
            that.setData({
              tabArr: tabArr
            })
          },
          fail(err){
            wx.hideLoading()
            wx.showToast({
              title: '上传失败',
              icon:'none'
            })
          }
        })
      }
    })
  },
  deleteImg(e){//删除图片
    let currentStatus = this.data.currentStatus
    let tabArr = this.data.tabArr
    let index = e.currentTarget.dataset.index
    let m = e.currentTarget.dataset.i
    tabArr[currentStatus].arr[index].imgUrl_list.splice(m,1)
    this.setData({
      tabArr: tabArr
    })
  },
  issueEvaluate(e){//发布评论
    let currentStatus = this.data.currentStatus
    let tabArr = this.data.tabArr
    let index = e.currentTarget.dataset.index
    let datas = tabArr[currentStatus].arr[index]
    let that = this
    
    if (!datas.grade){
      wx.showToast({
        title: '请给商品打分!',
        icon:'none'
      })
      return
    }
    if (!datas.content || datas.content.length<5) {
      wx.showToast({
        title: '请输入5-500评价内容!',
        icon: 'none'
      })
      return
    }
    if (datas.imgUrl_list.length > 0 && datas.imgUrl_list.length < 2) {
      wx.showToast({
        title: '请上传2~5张美照!',
        icon: 'none'
      })
      return
    }
    let imgList = []
    if (datas.imgUrl_list.length>0){
      for (var i in datas.imgUrl_list) {
        var obj_img={
          is_cover:0,
          img_url: datas.imgUrl_list[i]
        }
        imgList.push(obj_img)
      }
      imgList[0].is_cover = 1;
    }
    let params={
      "user_id": wx.getStorageSync("user_id"),
      "imgList": imgList,
      "rec_id": datas.rec_id,
      "order_id": datas.order_id,
      "id_value": datas.goods_id,
      "content": datas.content,
      "comment_rank": datas.grade,
      "saler_service_rank": datas.grade,
      "goods_post_rank": datas.grade,
      "deliver_rank": datas.grade,
      "install_rank": datas.grade,
      "string_type":1
    }
    wx.showLoading({
      title: '发布中...'
    })
    $.ajax({
      url: app.globalData.main_url+'comment/save.do',
      method: 'POST',
      data: params,
      success:function(res){
        console.log(res)
        wx.hideLoading()
        if (res.data.error == 0){
          tabArr[currentStatus].arr.splice(index,1)//删除当前的评价
          tabArr[1].page = 1;
          tabArr[1].arr = [];//评论完成清空已评价缓存数据
          //console.log('tabArr', tabArr[currentStatus].arr)
          that.setData({
            tabArr: tabArr
          })
          let num_lb = res.data.coinCount ? '乐币+' + res.data.coinCount:'';
          let num_grow = res.data.growthCount?'\r\n成长值+' + res.data.growthCount:''
          let titles = num_lb + num_grow
          if (!titles){
            titles = '评价成功!'
          }
          wx.showToast({
            title: titles,
            icon:'none',
            duration:2500
          })
          // wx.showModal({
          //   title: '评价成功!',
          //   content: '恭喜获得乐币' + res.data.coinCount + '个，成长值' + res.data.growthCount,
          //   showCancel:false
          // })
        }else{
          wx.showToast({
            title: res.data.msg,
            icon:'none'
          })
        }
      },
      fail:function(){
        wx.hideLoading()
      }
    })
  },
  getOrderList(){//获取订单列表
    
    let that = this
    let types
    let currentStatus = this.data.currentStatus
    let tabArr = this.data.tabArr
    let data_arr = tabArr[currentStatus].arr
    wx.showLoading({
      title: '加载中...',
    })
    if (currentStatus == '0'){
      types = 1;
    }else{
      types = 5;
    }
    $.ajax({
      url: `${requestPrefix}/user/evaluate/order_list/`,
      dataType: 'json',
      data: {
        order_type: types,
        page: this.data.tabArr[currentStatus].page
      },
      success: (result) => {
        wx.hideLoading()
        console.log('result:', result)
        if (result.data.data.length>0){
          for (var i in result.data.data){
            result.data.data[i].buy_time = $.util.formatTime(result.data.data[i].create_time) 
            if (currentStatus == '0'){
              let star_arr = new Array(5).fill(false)//初始化评分数组
              result.data.data[i].star_arr = star_arr
              result.data.data[i].grade = 0;//初始化评分
              result.data.data[i].imgUrl_list = []//初始化上传照片数组
            }else{
              let star_arr = new Array(5).fill(false)//已评论评分对应数组
              for (var j in star_arr){
                if (j < result.data.data[i].comment_rank){
                  star_arr[j] = true
                }
              }
              result.data.data[i].star_arr = star_arr
            }
          }
          data_arr = data_arr.concat(result.data.data)
          tabArr[currentStatus].arr = data_arr
          console.log('tabArr[currentStatus].arr', tabArr[currentStatus].arr)
          this.setData({
            tabArr: tabArr,
            login_status:true
          })
        }else{
          if (result.data.code == 200){
            this.setData({
              login_status: true
            })
          }
          if (result.data.code == 201){
            this.setData({
              login_status:false
            })
          }
          wx.showToast({
            title: result.data.msg,
            icon:'none'
          })
        }
      },
      fail: (err) => {
        wx.hideLoading()
        console.log('err:',err)
      }
    })
  },
  switchTab (e) {//切换
    let tabArr = this.data.tabArr;
    let index = e.currentTarget.dataset.index
    for (var i in tabArr){
      if (index == i){
        tabArr[i].active = true
      }else{
        tabArr[i].active = false
      }
    }
    this.setData({
      tabArr: tabArr,
      currentStatus: index
    })
    if (tabArr[index].arr.length<=0){
      this.getOrderList()
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    wx.showLoading({
      title: '数据加载中...',
    })
    setTimeout(function(){
      wx.hideLoading()
      that.getOrderList()
    },1600)
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
    let tabArr = this.data.tabArr;
    let currentStatus = this.data.currentStatus
    tabArr[currentStatus].page++;
    this.setData({
      tabArr: tabArr
    })
    this.getOrderList()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})