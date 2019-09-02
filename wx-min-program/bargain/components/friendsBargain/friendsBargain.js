// components/friendsBargain/friendsBargain.js
const app = getApp()
const quick = require('../../utils/quick.js')
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    goodsSn: String,
    goodsSkuSn: String,
    friendsBargainList: Array,
    isShow: Boolean,
  },

  /**
   * 组件的初始数据
   */
  data: {
    
  },

  attached: function(){
    
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getHelpBargainRecord(){
      this.triggerEvent('getHelpBargainRecord') 
    }
  }
})
