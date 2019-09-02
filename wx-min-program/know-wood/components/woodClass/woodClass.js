// components/woodClass/woodClass.js
const quick = require('../../utils/quick.js');
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
    articleList: []
  },

  attached: function () {
    this.searchWoodClass()
  },

  /**
   * 组件的方法列表
   */
  methods: {
    searchWoodClass(){
      quick.requestGet({ url: 'searchWoodClass' }).then((res) => {
        const { code, data } = res.data;
        if (code === 0) {
          this.setData({
            articleList: data.articleList
          })
        }
      })
    }
  }
})
