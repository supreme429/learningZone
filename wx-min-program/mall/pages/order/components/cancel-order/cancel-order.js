/*==================================================
 * project: meilele mall min-program 
 * author: leihao
 * createTime: 2018/09/11
 * file: serice-counselor.js
 * description: 预约服务顾问
 ==================================================*/
const $ = global;
const app = getApp();
const requestPrefix = app.globalData.domain;

Component({
  properties: {
    orderId: String
  },

  data: {
    // 图层显示控制
    flag_visiblity: true,

    // step1
    flag_step1_visiblity: false,
    // 选项数据
    data_options: [
      '现在不想购买',
      '有商品缺货',
      '更新或添加新商品',
      '红包或优惠券使用不成功',
      '商品价格比较贵',
      '支付不成功',
      '错误或重复下单',
      '其他'
    ],

    // 输入框
    customReason: '',
    // 禁止输入
    flag_disabled: 'disabled',

    // 选中的理由
    currentReason: '',

    // step2
    flag_step2_visiblity: true
  },

  methods: {
    /**
     * 切换图层显示 
    */
    toggleDisplayStatus: function() {
      if (!this.data.flag_step2_visiblity){
        return
      }
      if (this.data.flag_visiblity) {
        this.data.flag_visiblity = false;
        this.data.data_options = [
          '现在不想购买',
          '有商品缺货',
          '更新或添加新商品',
          '红包或优惠券使用不成功',
          '商品价格比较贵',
          '支付不成功',
          '错误或重复下单',
          '其他'
        ]
      } else {
        this.data.flag_visiblity = true;
        this.data.data_options = []
      }

      this.setData({
        flag_visiblity: this.data.flag_visiblity,
        currentReason: '',
        flag_disabled: 'disabled',
        customReason: '',
        data_options: this.data.data_options
      })
    },

    /**
     * 原因选项
    */
    getReasonOptionsEvent: function(e) {
      let val = e.currentTarget.dataset.value;

      if (val != '其他') {
        this.data.currentReason = val;
        this.data.flag_disabled = 'disabled';
      } else {
        this.data.currentReason = '';
        this.data.flag_disabled = '';
      }

      this.setData({
        currentReason: this.data.currentReason,
        flag_disabled: this.data.flag_disabled
      });
    },

    /**
     * 用户输入
    */
    getCustomReasonEvent: function(e) {
      let val = e.detail.value;

      this.data.currentReason = val;
      this.setData({
        currentReason: this.data.currentReason
      });
    },

    /**
     * 取消
    */
    cancelEvent: function() {
      this.data.flag_visiblity = true;
      this.setData({
        flag_visiblity: this.data.flag_visiblity,
        data_options:[]
      });
    },

    /**
     * 提交
    */
    submitEvent: function() {
      if (this.data.isLockSubmit) {
        return;
      }

      let orderId = this.data.orderId;
      let reason = this.data.currentReason;

      if (reason.length < 5) {
        wx.showModal({
          content: '理由不能少于5个字符',
          showCancel: false,
          confirmText: "确定"
        })
        return false;
      }

      let postData = {
        resoncon: reason,
        order_id: orderId,
        req_from: 'sapi'
      }

      this.data.isLockSubmit = true;
      this.setData({
        isLockSubmit: this.data.isLockSubmit
      });

      $.ajax({
        url: $.config.REQUEST_URL + '/user/?act=cancel_order',
        method: 'POST',
        header: { "content-Type": "application/x-www-form-urlencoded" },
        data: postData,
        dataType: 'json',
        success: (res)=>{
          if (typeof res.data === 'object') {
            if (res.data.error == 0) {
              this.data.flag_step1_visiblity = true;
              this.data.flag_step2_visiblity = false;
              this.data.isLockSubmit = false;
              this.setData({
                flag_step1_visiblity: this.data.flag_step1_visiblity,
                flag_step2_visiblity: this.data.flag_step2_visiblity,
                isLockSubmit: this.data.isLockSubmit
              });

              this._closeLayer();
            } else {
              failFn.call(this, res.data.msg);
              return false;
            }
          } else {
            failFn.call(this, res.data);
          }
        },
        fail: function() {
          failFn.call(this);
        }
      });

      function failFn(msg) {
        wx.showModal({
          content: msg || '有一点小意外，请稍后再试，谢谢',
          showCancel: false,
          confirmText: "确定"
        });

        this.data.flag_step1_visiblity = false;
        this.data.flag_step2_visiblity = true;
        this.data.isLockSubmit = false;
        this.setData({
          flag_step1_visiblity: this.data.flag_step1_visiblity,
          flag_step2_visiblity: this.data.flag_step2_visiblity,
          isLockSubmit: this.data.isLockSubmit
        });
      }
    },

    /**
     * 3秒后关闭图层
    */
    _closeLayer: function () {
      let _this = this;
      this.data.flag_visiblity = true;

      setTimeout(function () {
        _this.setData({
          flag_visiblity: _this.data.flag_visiblity,
          flag_step1_visiblity:false,
          flag_step2_visiblity:true,
          currentReason:'',
          data_options:[]
        });

        _this._callback();
      }, 2000);
    },

    /**
     * 回调主模板函数
    */
    _callback: function() {
      this.triggerEvent('cancelOrderCallback');
    }
  }
});


