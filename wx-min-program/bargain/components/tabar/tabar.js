// components/tabar/tabar.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    tabIndex: {
      type: Number,
      value: 0,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    tabs: [
      {
        title: '砍价商品',
        icon: '/images/tabar01.png',
        iconActive: '/images/tabar01-active.png',
        url: '/pages/index/index'
      },
      {
        title: '我的砍价',
        icon: '/images/tabar02.png',
        iconActive: '/images/tabar02-active.png',
        url: '/pages/bargainList/bargainList'
      }
    ]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    goUrl(e) {
      const { index } = e.currentTarget.dataset;
      if (index == this.properties.tabIndex) return;
      wx.redirectTo({
        url: this.data.tabs[index].url,
      });
    }
  }
})
