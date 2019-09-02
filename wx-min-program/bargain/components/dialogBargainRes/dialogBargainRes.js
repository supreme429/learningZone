// components/dialogBargainRes/dialogBargainRes.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    scene: {
      type: String,
      value: 'shareBargainByOwn'
    }, // 分享自砍 shareBargainByOwn || 自砍两刀 twoBargainByOwn
    price: {
      type: Number,
      value: 0
    }, // 砍价金额
    isShow: {
      type: Boolean,
      value: true
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
  },

  /**
   * 组件的方法列表
   */
  methods: {
    close() {
      this.setData({
        isShow: !this.data.isShow
      })
    }
  }
})
