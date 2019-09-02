// pages/edit-detail/edit-detail.js
Page({
    /**
     * 页面的初始数据
     */
    data: {
        goodsData: {},
        state: false,
        req_no: '',
        status:0,
        backState:false,
        check_point:'',
    },
    bindChangeValue(e) {
        //更新goodsData数据
        this.setData({
            goodsData: Object.assign({}, this.data.goodsData, { [e.currentTarget.dataset.name]: e.detail.value.trim() }),
            state:true
        })
    },
    goBackPrevPage() {
        //提交本次商品编辑修改的数据并返回到单据详情页
        let updateGoodsList = wx.getStorageSync('updateGoodsList');
        var list = Object.assign({}, updateGoodsList[this.data.req_no], { [this.data.goodsData.goods_sn]: this.data.goodsData } )
        wx.setStorageSync('updateGoodsList', Object.assign({}, updateGoodsList, { [this.data.req_no]: list }))
        
    },
    submitEditDetail() {
        this.goBackPrevPage();
        this.setData({
            state: false
        })
        wx.navigateBack({
            //返回上一个页面
            delta: 1,
        })
    },
    getUserSetting() {
        //获取用户的权限
        wx.getSetting({
            success: (res) => {
                console.log(res);
                if (!res.authSetting['scope.userLocation']) {
                    //判断是否已经获取定位的授权 如果没有发起请求授权的方法
                    wx.authorize({
                        scope: 'scope.userLocation',
                        success: () => {
                            //获取授权成功
                            wx.getLocation({
                                success: (res) => {
                                    this.setData({
                                        goodsData: Object.assign({}, this.data.goodsData, { latitude: String(res.latitude), longitude: String(res.longitude) })
                                        
                                    })
                                }
                            })
                        }
                    })
                } else {
                    wx.getLocation({
                        success: (res) => {
                            this.setData({
                                goodsData: Object.assign({}, this.data.goodsData, { latitude: String(res.latitude), longitude: String(res.longitude) })
                            })
                        }
                    })
                }

            }
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        if (options.req_no && options.goods_sn) {
            //获取单据号
            this.setData({
                req_no: options.req_no
            })
            if(options.status){
                this.setData({
                    status:options.status
                })
            }
            if (options.check_point){
                this.setData({
                    check_point: options.check_point
                })
            }
            let updateGoodsList = wx.getStorageSync('updateGoodsList');
            if (updateGoodsList[options.req_no] && updateGoodsList[options.req_no][options.goods_sn]){
                this.setData({
                    goodsData: updateGoodsList[options.req_no][options.goods_sn]
                })
            }else{
                if (options.data) {
                    let data = JSON.parse(options.data);
                    if (!data.CHECK_DATE) {
                        //判断默认时间是否有值
                        data.CHECK_DATE = `${new Date().getFullYear()}-${(new Date().getMonth() + 1) < 10 ? ('0' + (new Date().getMonth() + 1)) : (new Date().getMonth() + 1)}-${new Date().getDate() < 10 ? ('0' + new Date().getDate()) : new Date().getDate()}`//当前时间值
                    }
                    this.setData({
                        goodsData: data,

                    })
                }
            }
        }
        //获取用户授权
        this.getUserSetting()
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
        if (this.data.state && this.data.status != 4) {
            wx.showModal({
                title: '是否保存已填写信息?',
                success: (res) => {
                    if (res.confirm) {
                        this.goBackPrevPage();
                    } else if (res.cancel) {
                        console.log('用户点击取消')
                    }
                }
            })
        }
        wx.removeStorageSync('user_id');
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
})