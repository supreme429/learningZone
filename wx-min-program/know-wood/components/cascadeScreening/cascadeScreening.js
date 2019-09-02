// components/cascadeScreening/cascadeScreening.js
const quick = require('../../utils/quick.js');
const util = require('../../utils/util.js');
const { router } = require('../../utils/router.js')
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
    firstLevelList: [],
    secondLevelList: [],
    threeLevelList: [],
    firstIndex: '', //当前一级筛选索引
    secondIndex: '',  //当前二级筛选索引
    toggleTagClass: 'close',
    toggleThirdTTag: 'close',
    currentFirstId: '',
    currentFirstName: '',
    currentSecondId: '',
    currentSecondName: '',
    currentThreeId: '',
    currentThreeName: '',
    currentId: '',
    thirdTagTop: '',  //三级筛选的top
    secondTagHeight: '',  //二级导航的高
    trigleLeft: '', //三级导航三角形位置
    hasSaved: false,  //是否保存
  },

  attached: function () {
    this.setFactor();
    this.searchClassifyTag();
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //获取分类
    searchClassifyTag(){
      quick.requestGet({ url: 'searchClassifyTag' }).then((res) => {
        const { code, data } = res.data;
        if (code === 0) {
          this.setData({
            firstLevelList: data
          })
        }
      })
    },

    //设置屏幕比例
    setFactor() {
      util.getSystemInfoAsync().then(res => {
        this.setData({
          factor: res.screenWidth / 750
        })
      })
    },

    toPx(rpx) {    // rpx转px
      return rpx * this.data.factor;
    },
    showModalTags(event) {
      const { firstindex, firstid, firstname} = event.currentTarget.dataset;
      if (firstid == this.data.currentFirstId) {
        this.setData({
          toggleTagClass: this.data.toggleTagClass == 'close' ? 'show' : 'close',
          firstIndex: firstindex,
          toggleThirdTTag: 'close'
        })
      } else {
        this.setData({
          toggleTagClass: 'show',
          firstIndex: firstindex,
          toggleThirdTTag: 'close',
          currentSecondId: '',
          currentSecondName: '',
          currentThreeName: '',
          currentThreeId: '',
          threeLevelList: [],
          hasSaved: false,
        })
      }
      this.setData({
        currentFirstId: firstid,
        currentFirstName: firstname,
        secondLevelList: this.data.firstLevelList[firstindex].secondLevelList,
        secondTagHeight: 'auto'
      })
      if (this.data.hasSaved && this.data.threeLevelList.length > 0){
        this.setThirdTagPosition()
      }else{
        this.setFilterListHeight()
      }

      if (!this.data.hasSaved){
        this.setData({
          currentSecondId: '',
          currentSecondName: '',
        })
      }
    },
    chooseSecondTag(event) {
      const { secondindex, secondid,secondname} = event.target.dataset;
      const { firstLevelList, firstIndex} = this.data
      let threeLevelList = firstLevelList[firstIndex].secondLevelList[secondindex].threeLevelList || []
      if (this.data.currentSecondId == secondid) return;
      this.setData({
        secondIndex: secondindex,
        currentSecondId: secondid,
        currentSecondName: secondname,
        currentThreeName: '',
        currentThreeId: '',
        toggleThirdTTag: 'show',
        threeLevelList: threeLevelList
      })
      if (threeLevelList.length>0){
        this.setThirdTagPosition()
      }
    },

  //选择第三级
    chooseThirdTag(event){
      const { threeid, threename } = event.target.dataset;
      this.setData({
        currentThreeId: threeid,
        currentThreeName: threename,
      })
    },

    setThirdTagPosition(){
      // let secondTagTop;
      // let secondItemTop;
      let currentSecondId = this.data.currentSecondId
      
      Promise.all([this.getDomInfoById('#secondTag'), this.getDomInfoById(`#s${currentSecondId}s`), this.getDomInfoById(`#thirdTag`)]).then((resList)=>{
        this.setData({
          thirdTagTop: resList[1].top - resList[0].top + this.toPx(50)
        })
        let thirdTagTop = this.data.thirdTagTop;
        let thirTagHeight = resList[2].height + thirdTagTop + this.toPx(22)
        this.setData({
          secondTagHeight: resList[0].height > (thirTagHeight + thirdTagTop) ? resList[0].height : (thirTagHeight + this.toPx(142)),
          trigleLeft: resList[1].left + resList[1].width/2
        })
        this.setFilterListHeight()
      })
    },

    setFilterListHeight(){
      this.getDomInfoById('#tag-content').then((rect) =>{
        let options = {
          height: rect.height + this.toPx(30)
        }
        this.triggerEvent('setFilterListHeight', options);
      })
    },

    getDomInfoById(id) {
      var query = wx.createSelectorQuery().in(this)
      return new Promise((resolve, reject) => {
        query.select(id).boundingClientRect(function (rect) {
          resolve(rect)
        }).exec()
      })
    },

    //更多
    gotoMore(){
      wx.navigateTo({
        url: router('more'),
      })
    },
    
    //确定
    save(){
      let { currentFirstId, currentSecondId, currentThreeId, currentFirstName, currentSecondName, currentThreeName} = this.data
      if (currentSecondId == '') return;
      let options = { 
        firstId: currentFirstId,
        firstName: currentFirstName,
        secondId: currentSecondId,
        secondName: currentSecondName,
        threeId: currentThreeId,
        threeName: currentThreeName,
        idType: currentFirstName.indexOf('木材') != -1 ? 'c': 'a'
      };
      this.triggerEvent('save', options) ;
      this.setData({
        hasSaved: true
      })
      this.close('filter')
    },
    //关闭
    close(type){
      this.setData({
        toggleTagClass: 'close',
        toggleThirdTTag: 'close'
      })
      this.triggerEvent('close',{type:'filter'});
    },
    //重置
    reset(){
      this.setData({
        currentFirstId: '',
        currentSecondId: '',
        currentThreeId: '',
        hasSaved: false
      })
    },
    
    cancelBubble(){}
  }
})
