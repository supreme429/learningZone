// components/customService/customService.js
const { config } = require('../../config/config.js')
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
    
  },

  /**
   * 组件的方法列表
   */
  methods: {
    callService(){
      wx.makePhoneCall({
        phoneNumber: config.servicePhone 
      })
    }
  }
})
