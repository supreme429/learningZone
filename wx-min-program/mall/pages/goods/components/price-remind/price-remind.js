/*==================================================
 * project: meilele mall min-program 
 * author: leihao
 * createTime: 2018/09/11
 * file: goods-collect.js
 * description: 商品收藏订阅
 ==================================================*/
const $ = global;
const app = getApp();
const requestPrefix = app.globalData.domain;

Component({
  properties: {
    goodsId: String,
    effectPrice: String,
    shopPrice: String,
    regionInfo: Object
  },

  data: {
    // 图层显示控制
    flag_visiblity: true,

    // 商品收藏成功的提示图层控制
    flag_collect_success: true,

    // 控制提示文字
    flag_noticeTxt: false,

    // step1:获取用户授权手机号码
    flag_step_getUserPhone: false,
    // step2:填写手机号码和图形验证码
    flag_step_form: true,
    // step3:提交结果反馈
    flag_step_success: true,

    // 是否可以手动填写手机号码
    flag_phoneInputDisabled: '',

    // 手机号码
    phoneNumber: '',

    // 图形验证码
    captcha_img: '',

    // 反馈消息
    msgTxt: '',
    imgCaptch:''
  },

  methods: {
    /**
     * 切换图层显示 
    */
    toggleRemindPanel: function (isShowCollectSuccessStatus) {
      console.log(this.data.regionInfo)
      this.setData({//先将手机号置空
        phoneNumber:''
      })
      if (this.data.flag_visiblity) {
        this.data.flag_visiblity = false;
        this._checkPhoneInStorage()
      } else {
        this.data.flag_visiblity = true;
      }
      if (!this.data.flag_step_getUserPhone){
        this.setData({
          flag_step_form:true
        })
      }
      this.data.flag_collect_success = isShowCollectSuccessStatus ? false : true;

      this.setData({
        flag_visiblity: this.data.flag_visiblity,
        flag_collect_success: this.data.flag_collect_success,
        imgCapcha:'',
        flag_step_getUserPhone:false,
        flag_noticeTxt:false,
        msgTxt:''
      })
    },
    /**
      * 判断本地是否有授权手机号码
    */
    _checkPhoneInStorage: function () {
      let phone = wx.getStorageSync('phoneNumber');
      if (phone) {
        this.data.phoneNumber = phone;
        this.data.flag_step_form = true;
        this.data.flag_phoneInputDisabled = 'disabled';

        this.setData({
          phoneNumber: this.data.phoneNumber,
          flag_step_form: this.data.flag_step_form,
          flag_phoneInputDisabled: this.data.flag_phoneInputDisabled
        });

      }
    },
    /**
     * 获取用户授权，取得手机号码
    */
    bindGetUserPhoneEvent: function (e) {
      let that = this
      let msg = e.detail.errMsg;
      let regionInfo = this.data.regionInfo
      if (!regionInfo.phoneNumber){//未授权
        if (e.detail.errMsg == "getPhoneNumber:ok") {
          $.ajax({
            url: $.config.REQUEST_URL + 'dubbo_api/user/newThird/decodeMobile',
            data: {
              'encryptedData': e.detail.encryptedData,
              'iv': e.detail.iv
            },
            dataType: 'json',
            method: 'POST',
            success: function (res) {
              console.log(res)
              if (res.data.error == 0) {
                wx.setStorageSync('phoneNumber', res.data.desc)
                that.setData({
                  phoneNumber: res.data.desc,
                  flag_phoneInputDisabled: 'disabled'
                })
              }
            }
          })
          //登录
          let params = {
            'type': 3,
            'encryptedData': e.detail.encryptedData,
            'iv': e.detail.iv
          }
          $.util.userLogin(params)
        }
      }else{
        that.setData({
          phoneNumber: regionInfo.phoneNumber,
          flag_phoneInputDisabled: 'disabled'
        })
      } 
      this.data.flag_collect_success = true;
      this.data.flag_step_getUserPhone = true;
      this.data.flag_step_form = false;
      this.data.flag_step_success = true;
      //this.data.flag_phoneInputDisabled = '';
      //this.phoneNumber = e.detail.phoneNumber;

      this.data.captcha_img = $.util.getImgVerifyCode();

      this.setData({
        flag_collect_success: this.data.flag_collect_success,
        flag_step_getUserPhone: this.data.flag_step_getUserPhone,
        flag_step_form: this.data.flag_step_form,
        flag_step_success: this.data.flag_step_success,
        flag_phoneInputDisabled: this.data.flag_phoneInputDisabled,
        captcha_img: this.data.captcha_img
      });
    },

    /**
     * 刷新图形验证码
    */
    bindFlushImgCapcha: function() {
      this.data.captcha_img = $.util.getImgVerifyCode();
      this.setData({
        captcha_img: this.data.captcha_img
      });
    },

    /**
     * 清除消息提示
    */
    // bindClearMsgEvent: function() {
    //   this.data.msgTxt = '';
    //   this.setData({
    //     msgTxt: this.data.msgTxt
    //   });
    // },

    /**
     * 手动获取用户手机号码
    */
    bindUserPhoneEvent: function(e) {
      if (this.data.disabled == 'disabled') {
        return;
      }
      
      this.data.phoneNumber = e.detail.value;
      this.setData({
        phoneNumber: this.data.phoneNumber
      });
    },

    /**
     * 检测图形验证码
    */
    bindCheckImgCaptchaEvent: function(e) {
      this.setData({
        imgCaptch: e.detail.value,
        msgTxt:''
      })
    },
    /**
     * 发送信息
    */
    sendMessage:function(){
      let imgCaptch = this.data.imgCaptch
      console.log(imgCaptch)
      if (!imgCaptch){
        this.setData({
          msgTxt:'请输入验证码'
        })
        return
      }
      this._submit(imgCaptch);
    },
    /**
     * 3秒后关闭图层
    */
    _closeLayer: function() {
      let _this = this;
      //this.data.flag_visiblity = true;
      this.data.flag_step_form = false;
      this.data.flag_step_getUserPhone = true;
      this.data.flag_step_success = true;

      setTimeout(function(){
        _this.setData({
          flag_visiblity: true,
          flag_step_getUserPhone: _this.data.flag_step_getUserPhone,
          flag_step_success: _this.data.flag_step_success
        })
      }, 3000);
    },

    /**
     * 提交
    */
    _submit: function (imgCaptch) {
      if (this.data.submitLock) {
        return;
      }

      let _this = this;
      let phone = this.data.phoneNumber;
      let goodsId = this.data.goodsId;
      let effectPrice = this.data.effectPrice;
      let shopPrice = this.data.shopPrice;

      let regionInfo = this.data.regionInfo;
      let latitude = regionInfo.latitude;
      let longitude = regionInfo.longitude;
      let regionId = regionInfo.city_id;
      let regionName = regionInfo.city_name;
      let exprId = regionInfo.expr.id;      

      if (!/^1\d{10}/.test(phone)) {
        this.data.msgTxt = '手机号码格式错误';
        this.setData({
          msgTxt: this.data.msgTxt
        });
        return false;
      }

      var submitData = {
        'goodsId': goodsId, //采集表类型,传0，商品详情页传1
        'price': effectPrice, //采集类型,家居顾问服务=50,门店服务=51,商品详情页70
        'mobile': phone, //手机号
        'checkCode': imgCaptch, //图形验证码，没有传""
        'ogrlPrice': shopPrice,
        'captcha': imgCaptch, //图形验证码，没有传""
        'sendSource': 2,
        'exprFrom': 1,//体验馆id来源 1为系统推荐 2为cookie 3为广告位指定id
        'sysExprId': exprId, //体验馆ID
        'regionId': regionId,
        'sendContent': latitude + '|' + longitude + ',' + regionName //30.67994285|104.06792346,城市
      };

      this.data.submitLock = true;

      $.ajax({
        url: $.config.REQUEST_URL + '/solr_api/jmll/goods/downPriceNotice.do',
        data: submitData,
        dataType: 'json',
        method: 'GET',
        success: function (res) {
          _this.setData({
            imgCaptch:''
          })
          if (res && res.data) {
            let result = res.data;
            
            if (result.error == 0) {
              _this.data.flag_step_getUserPhone = true;
              _this.data.flag_step_form = true;
              _this.data.flag_step_success = false;
              _this.data.submitLock = false;
              let strs = 'mall'
              if (wx.getStorageSync('SOURCE')) {
                strs = wx.getStorageSync('SOURCE')
              }
              $.track.push(['trackEvent', 'goods', '采集', strs + '_' + _this.data.phoneNumber]);
              // $.track.push(['trackEvent', '降价通知', 'success', phone]);
            } else {
              _this.data.msgTxt = result.msg;

              _this.data.flag_step_getUserPhone = true;
              _this.data.flag_step_form = false;
              _this.data.flag_step_success = true;
              _this.data.submitLock = false;
            }

            _this.data.flag_noticeTxt = true;
            _this.setData({
              flag_noticeTxt: _this.data.flag_noticeTxt,
              msgTxt: _this.data.msgTxt,
              flag_step_getUserPhone: _this.data.flag_step_getUserPhone,
              flag_step_form: _this.data.flag_step_form,
              flag_step_success: _this.data.flag_step_success,
              submitLock: _this.data.submitLock
            });
            
            _this._closeLayer();
          }
        },
        fail: function() {
          _this.data.flag_noticeTxt = true;
          _this.data.msgTxt = '有一点点小意外，请稍后重试！';
          _this.data.flag_step_getUserPhone = true;
          _this.data.flag_step_form = false;
          _this.data.flag_step_success = true;
          _this.data.submitLock = false;
          _this.setData({
            msgTxt: _this.data.msgTxt,
            flag_step_getUserPhone: _this.data.flag_step_getUserPhone,
            flag_step_form: _this.data.flag_step_form,
            flag_step_success: _this.data.flag_step_success,
            submitLock: _this.data.submitLock,
            imgCaptch:''
          });
        }
      })
    }
  }
});


