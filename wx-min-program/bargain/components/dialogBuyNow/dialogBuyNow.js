// components/dialogBuyNow/dialogBuyNow.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isShow: {
      type: Boolean,
      value: false,
    },
    buyNowConfig: Object,
    bargainInfo: Object,
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
    buy() {
      this.triggerEvent('buy');
      this.close();
    },
    close() {
      this.triggerEvent('close')
    }
  }
})
