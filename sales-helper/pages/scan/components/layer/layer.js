/*==================================================
 * project: meilele mall min-program 
 * author: leihao
 * createTime: 2019/07/09
 * file: layer.js
 * description: 弹出层
 ==================================================*/


const app = getApp();

Component({
  properties: {
    params: Object
  },

  data: {
    // 图层显示控制
    flag_visiblity: true
  },

  methods: {
    /**
     * 打开图层 
    */
    open: function () {
      this.data.flag_visiblity = false;

      this.setData({
        flag_visiblity: this.data.flag_visiblity
      })
    },

    /**
     * 关闭图层
    */
    close: function () {
      this.data.flag_visiblity = true;

      this.setData({
        flag_visiblity: this.data.flag_visiblity
      });    
    }
  }
});


