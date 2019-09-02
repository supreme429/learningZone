// pages/search/search.js
const $ = global;
const app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        checkPoint: ['请选择', '组装前检查', '通知单送货前检查'],//验货环节
        checkStatus: ['请选择', '未验货', '已验货'],//验货状态
        searchData: {},
        defaultSearchData: {
            supplierName: '',//供应商名称
            reqNo: '',//单据号
            goodsSn: '',//商品型号
            checkPoint: 0,//验货环节
            //expected_date: `${new Date().getFullYear()}-${(new Date().getMonth() + 1) < 10 ? ('0' + (new Date().getMonth() + 1)) : (new Date().getMonth() + 1)}-${new Date().getDate() < 10 ? ('0' + new Date().getDate()) : new Date().getDate()}`,//期望验货日期取值
            expected_date: '请选择',
            status: 0,//验货状态
        }
    },
    clearSelctInput() {
        //清除条件
        this.setData({
            searchData: this.data.defaultSearchData
        })
    },
    submitSelectInput() {
        //提交搜索数据
        // let pages = getCurrentPages();
        // let prevpage = pages[pages.length - 1];//上一页
        // prevpage.setData({
        //     selectState: true,
        //     pageStart: 0,
        //     pageSize: 4,
        //     requestState:true,
        //     searchData:this.data.searchData
        // })
        let searchData = this.data.searchData;

        //原来验货状态是4个 初始化定义的数组索引1 对应状态为2  数组索引2对应状态为4
        if (this.data.searchData.status == '1') {
            searchData = { ...searchData, status: '2' }
        }
        if (this.data.searchData.status == '2') {
            searchData = { ...searchData, status: '4' }
        }

        wx.setStorageSync('searchData', searchData);

        if (this.data.searchData.expected_date == '请选择') {
            searchData = { ...searchData, expected_date: '' }
        }

        wx.navigateTo({
            url: `/pages/index/index?selectState=true&searchData=${JSON.stringify(searchData)}`,
        })
    },
    // getDefaultSearchData() {
    //     //获取初始默认值
    //     this.setData({
    //         defaultSearchData: Object.assign({}, this.data.searchData)
    //     })
    // },
    bindChangeValue: function (e) {
        // 搜索框取值
        console.log(e);
        this.setData({
            searchData: Object.assign({}, this.data.searchData, { [e.currentTarget.dataset.name]: e.detail.value.trim() })
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let searchData = wx.getStorageSync('searchData');
        if (searchData){
            this.setData({
                searchData: searchData
            })
        }else{
            this.setData({
                searchData: this.data.defaultSearchData
            })
        }
        
        //this.getDefaultSearchData();//获取搜索初始值

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