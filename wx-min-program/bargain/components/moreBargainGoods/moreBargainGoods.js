// components/moreBargainGoods/moreBargainGoods.js
const quick = require('../../utils/quick.js');
const util = require('../../utils/util.js');
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
   
  },

  /**
   * 组件的初始数据
   */
  data: {
    recommendGoods: [],
    handlePriceField: {
      lowestPrice: 'price',
      originalPrice: 'price',
      goodsPicUrl: 'mllImg'
    }
  },

  attached: function () {
    this.getRecommendGoods()
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //获取推荐商品
    getRecommendGoods(){
      if (!app.globalData.openId) {
        setTimeout(() => {
          this.getRecommendGoods()
        }, 10)
        return;
      }
      quick.requestGet({ url: 'getRecommendGoods' }, { openId: app.globalData.openId}).then((res) => {
        const { code, data } = res.data;
        if (code === 0) {
          this.formatResPrice(data)
          this.setData({
            recommendGoods: data,
          })
        }
      })
    },

    //处理返回数据的价格
    formatResPrice(data) {
      for (let i = 0; i < data.length; i++) {
        data[i] = util.handleData(data[i], this.data.handlePriceField);
      }
    },

    //跳到商品详情页
    goToGoodsDetail: function (e) {
      const { goodssn, goodsskusn, bruuid, bargainstatus } = e.currentTarget.dataset
      if (bruuid) {
        this.toggleModalBargaining(goodssn, goodsskusn, bruuid)
        return;
      }
      wx.navigateTo({
        url: '/pages/goodsDetail/goodsDetail?goodsSn=' + goodssn,
        success: function () {

        }
      })
    },

    toggleModalBargaining: function (goodsSn, goodsSkuSn, brUuid) {
      var title = '当前有未完成的砍价';
      var content = '该商品正在砍价中，快去邀请好友帮忙砍价吧';
      var confirmText = '查看详情';
      quick.toggleModal(title, content, this.goToBargainDetail(goodsSn, goodsSkuSn, brUuid), confirmText, '取消', true, '')
    },

    //查看砍价详情
    goToBargainDetail: function (goodsSn, goodsSkuSn, brUuid) {
      return function () {
        wx.navigateTo({
          url: '/pages/bargainDetail/bargainDetail?goodsSn=' + goodsSn + '&goodsSkuSn=' + goodsSkuSn + '&brUuid=' + brUuid,
          success: function () {

          }
        })
      }
    },

  }
})
