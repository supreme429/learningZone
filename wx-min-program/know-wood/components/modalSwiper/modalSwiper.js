// components/modalSwiper/modalSwiper.js
const quick = require('../../utils/quick.js');
const { router } = require('../../utils/router.js')
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
    bannerConfig: {
      index: 0
    },
    hotWoodList: [],
  },

  attached:function(){
    this.searchBanner()
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //swiper改变事件
    swiperChange(event){
      this.setData({
        'bannerConfig.index.': event.detail.current,
      })    
    },
    goToEncylopedia(event){
      let woodId = event.currentTarget.dataset.woodid
      wx.navigateTo({
        url: router('wiki', [`woodId=${woodId}`]),
      })
    },
    //去到更多
    gotoMore(){
      wx.navigateTo({
        url: router('more'),
      })
    },

    //banner数据接口
    searchBanner(){
      quick.requestGet({ url: 'searchBanner' }).then((res) => {
        const { code, data } = res.data;
        if (code === 0) {
          this.setData({
            hotWoodList: data.hotWoodList
          })
        }
      })
    }
  }
})
