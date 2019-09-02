// components/modalGetUserInfo/modalGetUserInfo.js
const app = getApp()
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
    phone: '',
    sex: '1',
    isChecked: false,
    isShowErrorTips: false,
    isDbSave: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 输入值
    inputValue(e) {
      const { field } = e.currentTarget.dataset;
      this.setData({
        [field]: e.detail.value
      })
    },
    checkPhone(){
      if (!(/^1[34578]\d{9}$/.test(this.data.phone))){
        this.data.isChecked = false;
        this.setData({
          isShowErrorTips: true
        })
        return
      }
      this.setData({
        isShowErrorTips: false
      })
      this.data.isChecked = true;
    },

    //保存用户信息
    saveUserInfo(){
      this.checkPhone();
      const { openId } = app.globalData
      const { phone } = this.data
      let formData = {
        openId: openId,
        phone: phone,
        collectionType: '102'
      }
      let {isChecked, isDbSave} = this.data
      if (isChecked && !isDbSave){
        this.data.isDbSave = true;
        quick.requestPost({ url: 'saveUserInfo' }, formData).then((res) => {
          const { code, data } = res.data;
          if (code === 0) {
            quick.showToastNone('恭喜您预约成功，请注意查收短信哦')
            this.close()
          }else{
            quick.showToastNone(
              code === 2 
              ? '感谢预约，稍后将有专属客服为您服务' 
              : '数据库开小差啦，请再来申请一次吧'
            )
          }
          this.data.isDbSave = false;
        })
      }
    },

    close() {
      this.triggerEvent('close')
    }

  }
})
