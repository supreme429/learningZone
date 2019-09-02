// components/dialogClassify/dialogClassify.js
const quick = require('../../utils/quick.js')
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    classifyConfig: Object,
    dialogStatus: String, //outer, inner
  },

  /**
   * 组件的初始数据
   */
  data: {
    classifyList: [],
    curFirClassifyName: '', //当前选中的一级分类名称
    curFirstClassifyId: '',
    curSecClassifyName: '', //当前选中的二级分类名称
    curSecClassifyId: '',
    curThirdClassifyName: '',
    curClassifyName: '',
    curClassifyId: '',
    curStep: 1, // 当前分类级数
  },

  attached: function () {
    this.getGoodsClassify();
  },

  /**
   * 组件的方法列表
   */
  methods: {

    //没次弹框进行数据初始化
    reset(){
      this.setData({
        curFirstClassifyName: '', //当前选中的一级分类名称
        curFirstClassifyId: '',
        curSecClassifyName: '', //当前选中的二级分类名称
        curSecClassifyId: '',
        curThirdClassifyName: '',
        curClassifyName: '',
        curClassifyId: '',
        tempCurClassifyName: '',
        tempCurClassifyId: '',
        curStep: 1,
      })
      this.getGoodsClassify();
    },
    //进来保存上一次数据
    initCurData(){
      let { curClassifyName, curClassifyId, type } = this.data.classifyConfig
      this.setData({
        curClassifyName: curClassifyName,
        curClassifyId: curClassifyId,
        curStep: type
      })
      if (type == 2){
        this.getGoodsClassify(this.data.curFirstClassifyId)
      }else{
        this.getGoodsClassify(this.data.curSecClassifyId)
      }     
    },
    getGoodsClassify(parentId){
      if (!app.globalData.openId) {
        setTimeout(() => {
          this.getGoodsClassify()
        }, 10)
        return;
      }
      const data = {
        openId: app.globalData.openId,
        classifyId: parentId!== undefined ? parentId: '',
        type: this.data.curStep,
      }
      quick.requestGet({ url: 'getGoodsClassify' }, data).then((res) => {
        const { code, data } = res.data;
        if (code === 0) {
          this.setData({
            'classifyList': data,
          })
        }
      })
    },
    //选择列表里的分类
    selectClassify(e){
      let { step, classifyName, classifyId} = e.target.dataset.item
      
      if (this.data.curStep<4){
        this.setData({
          curStep: ++this.data.curStep
        })
      }
          
      if (this.data.curStep<4){
        if (this.data.curStep==2){
          this.setData({
            curFirstClassifyName: classifyName,
            curFirstClassifyId: classifyId,  
            classifyList: [],        
          })
        } else if (this.data.curStep == 3){
          this.setData({
            curSecClassifyName: classifyName,
            curSecClassifyId: classifyId,
            classifyList: [],
          })
        }
        this.getGoodsClassify(classifyId)
      }
      this.setData({
        curClassifyName: classifyName,
        curClassifyId: classifyId,
      })      
    },

    //点击级数标题时执行
    selectTitleClassify(e){
      let step = e.target.dataset.step;
      this.setData({
        curStep: step
      })
      this.returnUpStep()
    },
    //返回上一级
    returnUpStep(){
      if (this.data.curStep>=3){
        this.setData({
          curStep: 2
        })
      } else if (this.data.curStep == 2){
        this.setData({
          curStep: 1
        })
      }
      
      switch (this.data.curStep){
        case 1:
          this.setData({
            curClassifyName: '',
            curClassifyId: '',
            classifyList: [],
          })
          this.getGoodsClassify()
          break;
        case 2:
          this.setData({
            curClassifyName: this.data.curFirstClassifyName,
            curClassifyId: this.data.curFirstClassifyId,
            classifyList: [],
          })
          this.getGoodsClassify(this.data.curFirstClassifyId)
          break;
        case 3:
          this.setData({
            curClassifyName: this.data.curSecClassifyName,
            curClassifyId: this.data.curSecClassifyId,
            classifyList: [],
          })
          this.getGoodsClassify(this.data.curSecClassifyId)
          break;
        default:
          return;
      }
    },
    //确定保存
    save(){
      let { curClassifyName, curClassifyId } = this.data
      let formData = { 
        curClassifyName: curClassifyName,
        curClassifyId: curClassifyId,
        type: --this.data.curStep
      }
      this.triggerEvent('save', formData)
      this.setData({
        type: ++this.data.curStep
      })
    },
    //取消关闭
    close(){
      this.triggerEvent('close')
    },
    //防止冒泡
    cancelBuble(){},
  }
})
