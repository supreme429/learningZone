// components/hotSearch/hotSearch.js
const app = getApp();
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
    keywords: [],
  },

  attached() {
    this.getKeywords();
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getKeywords(i = 0) {
      if(i > 5) return;
      if(app.globalData.keywords.length > 0) {
        this.setData({
          keywords: app.globalData.keywords.slice(0, 3)
        })
        return ;
      }
      setTimeout(() => {
        this.getKeywords(i++);
      }, 500)
    }
  }
})
