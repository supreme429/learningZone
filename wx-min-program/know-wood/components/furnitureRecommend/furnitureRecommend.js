// components/furnitureRecommend/furnitureRecommend.js
const { goOtherMini } = require('../../utils/router.js');
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    list: Array
  },

  /**
   * 组件的初始数据
   */
  data: {
    hotItemData: {
      title: '相关家具推荐',
      url: '',
    }
  },  
  attached() {
    this.setData({
      url: ''
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {
    goMore: () => {
      goOtherMini();
    },
    goMini(e) {
      const { goodsid } = e.currentTarget.dataset;
      // 拼接path
      goOtherMini();
    }
  }
})
