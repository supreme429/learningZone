// pages/detail/detail.js
const $ = global;
const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        orderId: 'REQ-20190702-B001', //单据型号
        orderDetail: {}, //单据详情
        updateGoodsList: {}, //提交的数据对象
        updateState: true, //防止重复提交
        is_visitor: 0, //判断是否为游客
        checkPoint: ['', '组装前检查', '通知单送货前检查'], //验货环节
    },
    submitOrderInfo() {
        wx.showModal({
            title: '请确认填写数据的正确性！',
            content: '提交之后不可修改!',
            success: (res) => {
                if (res.confirm) {
                    //提交编辑

                    let req_no = this.data.orderDetail.req_no;
                    if (this.data.updateGoodsList[req_no]) {
                        //对象转化为数组
                        let data = [];
                        for (let value of Object.keys(this.data.updateGoodsList[req_no])) {
                            data.push(this.data.updateGoodsList[req_no][value])
                        }

                        function handleSubmitData(data) {
                            //对特殊符号进行转译
                            for (let value of data) {
                                value.goods_sn = encodeURIComponent(value.goods_sn)
                            }
                            return data;
                        }
                        data = handleSubmitData(data)
                        if (data.length !== this.data.orderDetail['goods_info'].length) {
                            wx.showToast({
                                title: '存在商品未验货,请对所有的商品进行保存后提交！',
                                mask: true,
                                icon: 'none',
                                duration: 2000
                            })
                            return;
                        }
                        if (this.data.is_visitor === 1) {
                            //如果是游客身份
                            let old = Object.assign({}, this.data.updateGoodsList);
                            delete old[req_no];
                            this.setData({
                                updateGoodsList: old, //清除上次提交的数据
                            }, () => {
                                wx.setStorageSync('updateGoodsList', this.data.updateGoodsList)
                            })
                            wx.showToast({
                                title: '提交成功',
                                mask: true,
                                icon: 'none',
                                duration: 2000,
                                success() {
                                    wx.navigateTo({
                                        url: '/pages/index/index'
                                    })
                                }
                            })

                            return;
                        }
                        //获取需要提交的数据的整体对象
                        let submitData = Object.assign({}, this.data.orderDetail, {
                            goods_info: JSON.stringify(data)
                        });

                        // delete this.data.orderDetail['goods_info'];
                        // let submitData = this.data.orderDetail;
                        if (this.data.updateState) {
                            this.data.updateState = false;
                            wx.showToast({
                                title: '正在提交数据',
                                mask: true,
                                icon: 'loading',
                                duration: 2000
                            })
                            $.ajax({
                                url: `${$.config.baseUrl}/dubbo_api/support/erpwxapp/orderSubmit`,
                                //url: 'http://192.168.1.53:8992/support/erpwxapp/orderSubmit',
                                method: 'POST',
                                dataType: 'json',
                                data: submitData,
                                success: (res) => {
                                    this.data.updateState = true;
                                    if (res.error === 0) {

                                        let old = Object.assign({}, this.data.updateGoodsList);
                                        delete old[req_no];
                                        this.setData({
                                            updateGoodsList: old, //清除上次提交的数据
                                        }, () => {
                                            wx.setStorageSync('updateGoodsList', this.data.updateGoodsList);
                                            wx.hideToast();
                                            wx.showToast({
                                                title: '提交成功',
                                                mask: true,
                                                image: '/images/common/success.png',
                                                duration: 2000,
                                                success() {
                                                    wx.navigateTo({
                                                        url: '/pages/index/index'
                                                    })
                                                }
                                            })
                                        })


                                    } else {
                                        wx.showToast({
                                            title: '提交失败请检查网络',
                                            mask: true,
                                            image: '/images/common/error.png',
                                            duration: 1000
                                        })
                                    }
                                },
                                fail: () => {
                                    wx.showToast({
                                        title: '提交失败请检查网络',
                                        mask: true,
                                        image: '/images/common/error.png',
                                        duration: 1000
                                    })
                                }
                            })
                        }
                    } else {
                        wx.showToast({
                            title: '没有需要更新的数据',
                            mask: true,
                            icon: 'none',
                            duration: 2000
                        })
                    }
                }
            }
        })

    },
    navigatorEditDetail(e) {
        //跳转到编辑商品详情页

        wx.navigateTo({
            url: `/pages/edit-detail/edit-detail?data=${JSON.stringify(this.data.orderDetail['goods_info'][e.currentTarget.dataset.key])}&req_no=${this.data.orderDetail.req_no}&goods_sn=${this.data.orderDetail['goods_info'][e.currentTarget.dataset.key]['goods_sn']}&&status=${this.data.orderDetail['status']}&&check_point=${this.data.orderDetail['check_point']}`,
        })

    },
    requestOrderDetail() {
        //请求单据详情
        $.ajax({
            url: `${$.config.baseUrl}/dubbo_api/support/erpwxapp/checkOrderDetail?req_no=${this.data.orderId}`,
            method: 'GET',
            dataType: 'json',
            success: (res) => {
                setTimeout(function() {
                    wx.hideLoading();
                }, 1000)
                if (res.data) {
                    let data = res.data
                    if (!data.EXPECTED_DATE) {
                        data = Object.assign({}, data, {
                            EXPECTED_DATE: `${new Date().getFullYear()}-${(new Date().getMonth() + 1) < 10 ? ('0' + (new Date().getMonth() + 1)) : (new Date().getMonth() + 1)}-${new Date().getDate() < 10 ? ('0' + new Date().getDate()) : new Date().getDate()}`
                        })
                    }
                    this.setData({
                        orderDetail: data,
                    })
                } else {
                    wx.showToast({
                        title: '请求失败',
                        mask: true,
                        image: '/images/common/error.png',
                        duration: 1000
                    })
                }
            },
            fail: (error) => {
                wx.hideLoading();
                wx.showToast({
                    title: '请求失败',
                    mask: true,
                    image: '/images/common/error.png',
                    duration: 1000
                })
            }
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {

        wx.showLoading({
            title: '数据加载中...',
        })
        if (options.orderId) {
            this.setData({
                orderId: options.orderId
            }, () => {
                this.requestOrderDetail()
            })
        } else {
            this.requestOrderDetail()
        }

        //更新用户身份
        this.setData({
            is_visitor: wx.getStorageSync('is_visitor')
        })

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        //获取storage上的更新数据
        this.setData({
            updateGoodsList: wx.getStorageSync('updateGoodsList')
        })
    },
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

        // let pages = getCurrentPages();
        // console.log(pages);
        // let index = pages.findIndex((value) => {
        //     return value.route === "pages/index/index"
        // })
        // let prevPage = pages[index];
        // prevPage.setData({
        //     updateGoodsList:this.data.updateGoodsList
        // },()=>{
        //     console.log(prevPage.data.updateGoodsList)
        // })
        wx.removeStorageSync('user_id');
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },
})