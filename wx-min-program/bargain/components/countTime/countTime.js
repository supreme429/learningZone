// components/countTime/countTime.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    timeStamp: Number,  //时间戳
    layoutType: String,  //样式类型
    countType: String,  //倒数类型：秒or毫秒
    index: Number,  //用于列表的倒计时所以
    stopCountTime: Boolean, //true:停止
    isSetData: { // 是否执行setData页面渲染
      type: Boolean,
      value: true
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    hours: '',
    minutes: '',
    seconds: '',
    milliseconds: '',
    countDegree: 50
  },

  attached: function () {
    this.countDown()
  },

  /**
   * 组件的方法列表
   */
  methods: {
    countDown() {
      if (this.data.stopCountTime) return; //离开页面停止计时

      var self = this;
      this.data.timeStamp = this.data.timeStamp - this.data.countDegree
      let result = this.data.timeStamp
      var h = parseInt(result / (60 * 60 * 1000));//精确小时，用取余
      var m = parseInt((result - h * 60 * 60 * 1000) / (60 * 1000));
      var s = parseInt((result - h * 60 * 60 * 1000 - m * 60 * 1000) / 1000);
      var ms = result - h * 60 * 60 * 1000 - m * 60 * 1000 - s *1000

      if (this.data.isSetData) {
        this.setData({
          hours: h < 10 ? '0' + (h < 0 ? 0 : h) : h,
          minutes: m < 10 ? '0' + (m < 0 ? 0 : m) : m,
          seconds: s < 10 ? '0' + (s < 0 ? 0 : s) : s,
          milliseconds: ms < 10 ? '0' + (ms < 0 ? 0 : ms) : (ms >= 100 ? parseInt(ms / 10) : ms)
        })
      }
      
      if (result > 0){
        setTimeout(function () { self.countDown() }, this.data.countDegree);
      }else{
        let indexOption = {index: this.data.index}
        this.triggerEvent('callback', indexOption) //倒计时结速执行回调
      }
    }
  }
})
