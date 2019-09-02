// components/dialogMoveBargain/dialogMoveBargain.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    helpRes: Object,
  },

  /**
   * 组件的初始数据
   */
  data: {
    helpBargainInfo: '',
    helpTextCol:{
      '0': "<p class='helpBargainDetail'>神之一指, 帮他砍去<span class='price'>{{cutAmount}}</span>元</p>",
      '1': "<p class='helpBargainDetail'>Nice！快准狠第一刀！<br/>成功砍掉<span class='price'>{{cutAmount}}</span>元</p>"
    },
    touchStart: '',
    touchEnd: '',
    moveTimeOut: 1000,
    showMoveImg: true
  },

  attached: function () {
    this.toggleImg();
    this.setHelpBargainInfo();
  },
  /**
   * 组件的方法列表
   */
  methods: {
    toggleImg(){
      setTimeout(()=>{
        this.setData({
          showMoveImg: false
        })
      },1000)
    },
    setHelpBargainInfo(){
      const helpRes = this.data.helpRes;
      let isCrit = this.data.helpRes.isCrit || '0'
      let copyWrite = this.data.helpTextCol[isCrit]
      for (let k in helpRes) {
        let reg = new RegExp('\{\{' + k + '\}\}', "g");
        copyWrite = copyWrite.replace(reg, helpRes[k]);
      }
      this.setData({
        helpBargainInfo: copyWrite
      })
    },
    // helpBargain(){
    //   this.triggerEvent('helpBargain') 
    // },
    // moveStart(e){
    //   this.setData({
    //     //设置触摸起始点水平方向位置
    //     touchStart: e.touches[0].clientX,
    //   });
    // },
    // moveEnd(e){
    //   this.setData({
    //     //记录结束位置
    //     touchEnd: e.changedTouches[0].clientX
    //   });
    //   let { touchStart, touchEnd} = this.data
    //   this.helpBargain()    
    // },
  }
})
