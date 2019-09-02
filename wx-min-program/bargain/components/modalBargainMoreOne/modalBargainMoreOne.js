// components/modalBargainMoreOne/modalBargainMoreOne.js
const business = require('../../utils/business.js');
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
    isShow: true
  },

  /**
   * 组件的方法列表
   */
  methods: {
    toggleModalBargainMoreOne(event){
      business.saveFormId(app.globalData.openId, event.detail.formId)
      this.triggerEvent('toggleModal')
    }
  }
})
