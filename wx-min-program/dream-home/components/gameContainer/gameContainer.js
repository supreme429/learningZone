// components/gameContainer/gameContainer.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    gcheight: String,
    bg: {
      type: String,
      value: '',
    },
    locations: {
      type: Array,
      value: [],
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  // ready() {
  //   console.log(this)
  //   const query = wx.createSelectorQuery().in(this)
  //   query.select('#game-bg').fields({
  //     size: true,
  //     context: true,
  //   }, res => {
  //     console.log('setbg:',res)
  //     this.triggerEvent('setbg', res)
  //   }).exec();
  // },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
