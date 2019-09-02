// components/detailInfo/detailInfo.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    content: Array,
    imgs: Array,
    isShow: Boolean
  },

  data: {
    showContent: []
  },

  ready() {
    setTimeout(() => {
      if (Array.isArray(this.properties.content)) {
        this.properties.content.forEach((item, index) => {
          this.properties.content[index].value = item.value.replace(/^\,+/, '')
        })
        
        this.setData({
          showContent: this.properties.content
        })
      }
    }, 500)
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

  }
})
