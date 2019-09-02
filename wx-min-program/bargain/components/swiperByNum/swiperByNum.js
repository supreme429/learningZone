// components/swiperByNum/swiperByNum.js
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {
    imgs: Array,
    autoplay: {
      type: Boolean,
      value: true
    },
    interval: {
      type: Number,
      value: 4000
    },
    showRule: {
      type: Boolean,
      value: true
    },
    richText: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    imgsList: [],
    current: 0,
    dialogRule: false,
  },

  attached() {
    this.setImgsList();
  },

  /**
   * 组件的方法列表
   */
  methods: {
    setImgsList() {
      if (!this.data.imgs.length) {
        setTimeout(() => {
          this.setImgsList();
        }, 300)
      }
      this.setData({
        imgsList: this.data.imgs.slice(0, 5)
      })
    },
    changeCurrent(event){
      this.setData({
        current: event.detail.current
      })
    },

    toggleDialogRule() {
      this.setData({
        dialogRule: !this.data.dialogRule
      })
    },
  }
})
