//index.js
//获取应用实例
const $ = global;
const app = getApp();

// pages/index/index.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        pageStart: 0,
        pageSize: 4,
        checkList: [],
        requestState: true,//是否允许请求
        fixed: false,
        scrollTop: 0,//获取滚动距离
        updateGoodsList: [],//本地存储待更新的数据
        searchData: [],//搜索条件
        is_visitor: false,//判断是否游客身份
        networkType: true,//判断是否有网络
        selectState: false,//判断页面是否变为搜索结果页
        //userId: 1,//用户id,
        checkPoint: ['', '组装前检查', '通知单送货前检查'],//验货环节
    },
    navigatorDetail(e) {
        //点击跳转详情页  拼url参数
        wx.navigateTo({
            url: `/pages/detail/detail?orderId=${e.currentTarget.dataset.key}&updateGoodsList=${JSON.stringify(this.data.updateGoodsList)}`,
        })
    },
    requestOrderData() {
        //分页请求单据页面首页数据
        $.ajax({
            url: `${$.config.baseUrl}/dubbo_api/support/erpwxapp/checkList`,
            mehtod: 'GET',
            dataType: 'json',
            data: { pageStart: this.data.pageStart, pageSize: this.data.pageSize},
            success: (res, is_visitor) => {
                setTimeout(function () {
                    wx.hideLoading();
                }, 1000)
                this.setData({
                    is_visitor: is_visitor
                })
                if (res.error === 0) {
                    if (res.data.checkList.length > 0) {
                        let size = res.data.checkList.length;
                        this.setData({
                            pageStart: this.data.pageStart + size,
                            checkList: this.data.checkList.concat(res.data.checkList)
                        })
                    } else {
                        this.setData({
                            requestState: false
                        })
                    }
                } else {
                    wx.showToast({
                        title: '提交失败',
                        mask: true,
                        image: '/images/common/error.png',
                        duration: 1000
                    })
                }
            },
            fail: (error) => {
                wx.hideLoading();
                wx.showToast({
                    title: '提交失败',
                    mask: true,
                    image: '/images/common/error.png',
                    duration: 1000
                })
            }
        });
    },
    requestSelectOrderData() {
        //请求筛选条件接口
        let data = Object.assign({}, this.data.searchData, { pageStart: this.data.pageStart, pageSize: 4})
        $.ajax({
            url: `${$.config.baseUrl}/dubbo_api/support/erpwxapp/searchOrder`,
            //url: `http://192.168.1.53:8992/support/erpwxapp/searchOrder`,
            method: 'POST',
            dataType: 'json',
            data: data,
            success: (res) => {
                setTimeout(function () {
                    wx.hideLoading();
                }, 1000)

                if (res.error === 0) {
                    if (this.data.pageStart == 0 && res.data.checkList.length === 0){
                        wx.showToast({
                            title: '没有满足条件的结果',
                            icon:'none',
                            duration: 1000
                        })
                    }
                    if (res.data.checkList.length > 0){
                        this.setData({
                            pageStart: this.data.pageStart + res.data.checkList.length,
                            checkList: this.data.checkList.concat(res.data.checkList)
                        })
                    } else {
                        this.setData({
                            requestState: false
                        })
                    }
                    
                } else {
                    wx.showToast({
                        title: '搜索失败,请检查网络',
                        mask: true,
                        image: '/images/common/error.png',
                    })
                }

            },
            fail: (error) => {
                wx.hideLoading();
                wx.showToast({
                    title: '搜索失败,请检查网络',
                    mask: true,
                    image: '/images/common/error.png',
                })
            }
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.showLoading({
            title: '数据加载中...',
        })
        // this.setData({
        //     is_visitor: wx.getStorageSync('is_visitor'),
        //     userId: wx.getStorageSync('user_id'),
        // })
        wx.getNetworkType({
            //判断是否有网络
            success(res) {
                if (res.networkType == 'none') {
                    this.setData({
                        networkType: false
                    })
                }

            }
        })
        if (options.selectState) {
            this.setData({
                pageStart: 0,
                pageSize: 4,
                checkList: [],
                requestState: true,//是否允许请求
                searchData: JSON.parse(options.searchData),
                selectState: options.selectState,
            })
        }

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        if (this.data.networkType) {
            //有网络
            if (this.data.selectState) {
                //进入搜索结果显示
                this.requestSelectOrderData()
            } else {
                //初始化显示所有
                this.requestOrderData();
            }
        }else{
            console.log(123);
            wx.hideLoading();
        }


    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        //获取storage上的更新数据
        this.setData({
            updateGoodsList: wx.getStorageSync('updateGoodsList')
        })
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        wx.removeStorageSync('user_id');
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
        this.setData({
            updateGoodsList: this.data.updateGoodsList
        })

        this.setData({
            pageStart: 0,
            checkList: [],
            requestState: true,
        }, () => {
            
            if (this.data.selectState) {
                //如果是搜索结果页
                this.requestSelectOrderData()
            } else {
                this.requestOrderData()
            }
        })
        setTimeout(function(){
            wx.stopPullDownRefresh()
        })
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

        if (this.data.selectState) {
            //如果是搜索结果页
            if (this.data.requestState) {
                this.requestSelectOrderData()
            }
        } else {
            if (this.data.requestState) {
                this.requestOrderData()
            }
        }
        

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
            title:'验货宝',
            imageUrl: '/images/common/logo.png'
        }
    },
    onPageScroll(ev) {
        //页面滚动事件
        if (ev.scrollTop <= 0) {
            ev.scrollTop = 0;
        } else if (ev.scrollTop > wx.getSystemInfoSync().windowHeight) {
            ev.scrollTop = wx.getSystemInfoSync().windowHeight;
        }
        //判断浏览器滚动条上下滚动
        if (ev.scrollTop > this.data.scrollTop || ev.scrollTop == wx.getSystemInfoSync().windowHeight || ev.scrollTop === 0) {
            //向下滚动
            if (this.data.fixed) {
                this.setData({
                    fixed: false
                })
            }

        } else {
            //向上滚动
            if (!this.data.fixed) {
                this.setData({
                    fixed: true
                })
            }

        }
        //给scrollTop重新赋值
        setTimeout(() => {
            this.setData({
                scrollTop: ev.scrollTop
            })
        }, 0)
    }
})