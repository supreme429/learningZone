// components/formSearch/formSearch.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    keyword: String,
    searchWord: String
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
    setKeyWord(event){
      let valueOption = { keyword: event.detail.value }
      this.triggerEvent('setKeyword', valueOption)
    },
    search(){
      if(this.data.keyword==='') return;
      this.triggerEvent('search')
    },
    //清空搜索栏
    deleteKeyWord(){
      console.log(312321);
      this.triggerEvent('deleteKeyWord')
    }
  }
})
