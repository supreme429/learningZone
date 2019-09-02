// components/ourRecommend/ourRecommend.js
const { router } = require('../../utils/router.js')
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    list: {
      type: Array, 
      value: [], // 属性初始值（可选），如果未指定则会根据类型选择一个
    },
    recid: String,
    rectype: String,
    reclevel: Number
  },

  /**
   * 组件的初始数据
   */
  data: {
    hotItemData: {
      title: '小编推荐',
    }
  },

  attached() {
  },

  /**
   * 组件的方法列表
   */
  methods: {
    goMore() {
      const { recid, rectype, reclevel } = this.data;
      wx.navigateTo({
        url: router('materials', [`editorRecId=${recid}`, `editorRecIdType=${rectype}`, `editorRecIdLevel=${reclevel}`])
      })
    },
    goPageWiki(e) {
      const { woodid } = e.currentTarget.dataset;
      wx.navigateTo({
        url: router('wiki', [`woodId=${woodid}`]),
      })
    }
  }
})
