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
    regionInfo: Object
  },

  data: {
    // 图层显示控制
    flag_visiblity: true,

    // step1:获取用户授权手机号码、选择体验馆、图形验证码
    flag_step_form: false,
    // step2:提交结果反馈
    flag_step_success: true,

    // 获取手机号码按钮
    flag_phoneButton: false,
    // 填写手机号输入框
    flag_phoneInput: false,
    // 手机号码
    phoneNumber: '',

    // 体验馆列表
    data_exprList: [],
    // 在actionsheet中显示的列表
    data_pickerList: [],

    // 选中的体验馆
    data_selectedExpr: {
      id: '...',
      txt: '...'
    },

    // 图像验证码图层
    flag_imgCaptcha: true,
    // 图形验证输入框
    imgCapcha: '',
    // 图形验证码
    captcha_img: '',

    flag_phoneInputDisabled: '',

    // 消息提示
    notice_msg: '',

    // 绑定提交事件的按钮
    eventButton: false,
    // 未绑定事件的按钮
    placeholderButton: true,
    // 按钮文字
    buttonTxt: '免费预约家居顾问',
    imgHttp: app.globalData.imagesUrl
  },

  methods: {
    /**
     * 切换图层显示 
    */
    toggleDisplayStatus: function() {
      this.setData({
        phoneNumber:''
      })
      if (!this.data.flag_step_success){
        flag_step_form:true
      }
      if (this.data.flag_visiblity) {
        this.data.flag_visiblity = false;
        this.getExprListByDistance();
        this._checkPhoneInStorage();
      } else {
        this.data.flag_visiblity = true;
      }
      console.log('服务组件', this.data.flag_visiblity)
      this.setData({
        flag_visiblity: this.data.flag_visiblity,
        notice_msg:''
      })
    },

    /**
     * 获取周边200公里以内的体验馆
    */
    getExprListByDistance: function() {
      let _this = this;
      let latitude = this.data.regionInfo.latitude;
      let longitude = this.data.regionInfo.longitude;

      $.ajax({
        url: requestPrefix + '/goods/location/getExprListByDistance/?latitude=' + latitude + '&longitude=' + longitude + '&distance=200&iVersion=1.0',
        dataType: 'json',
        method: 'GET',
        success: function (res) {
          let data_arr = []
          if (res && res.data) {
            let exprData = res.data.data;
            let exprList = [];

            exprData.forEach(function (item) {
              if (item.leader_avatar && item.leader_avatar.indexOf('/') !=0){
                item.leader_avatar = '/' + item.leader_avatar
              }
              let distans = (item.distance / 1000).toFixed(2);
              item.showTxt = item.name + ' 距离您约' + distans + 'km';
              data_arr.push(item.showTxt);
            });
            _this.data.data_selectedExpr = exprData[0]
            _this.data.data_selectedExpr.id = exprData[0].id;
            _this.data.data_selectedExpr.txt = exprData[0].showTxt;
            
            _this.setData({
              data_exprList: exprData,
              data_pickerList: data_arr,
              data_selectedExpr: _this.data.data_selectedExpr
            });
          }
        }
      });
    },
    /**
         * 判断本地是否有授权手机号码
        */
    _checkPhoneInStorage: function () {
      let phone = wx.getStorageSync('phoneNumber');
      if (phone) {
        this.data.phoneNumber = phone;
        this.data.flag_phoneButton = true;
        this.data.flag_phoneInput = true;
        this.data.flag_phoneInputDisabled = 'disabled';

        this.setData({
          phoneNumber: this.data.phoneNumber,
          flag_phoneButton: this.data.flag_phoneButton,
          flag_phoneInput: this.data.flag_phoneInput,
          flag_phoneInputDisabled: this.data.flag_phoneInputDisabled
        });

      }
    },
    /**
     * 获取用户授权，取得手机号码
    */
    bindGetUserPhoneEvent: function(e) {
      this.bindClearMsgEvent();
      
      let that = this
      let msg = e.detail.errMsg;

      if (msg.match(/fail/)) {
        this.setData({
          flag_phoneButton: true,
          flag_phoneInput: true,
          flag_phoneInputDisabled:''
        });
      } else {
        this.setData({
          flag_phoneButton: true,
          flag_phoneInput: true,
          flag_phoneInputDisabled:''
        });
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
                flag_phoneInputDisabled: 'disabled',
                notice_msg:'',
                flag_phoneButton: true,
              })
              that.bindOrderEvent()
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
    },

    /**
     * 获取用户手动输入的手机号码
    */
    getUserInputPhoneevent: function(e) {
      let phone = e.detail.value;
      this.setData({
        phoneNumber: phone
      });
      // if (/^1\d{10}/.test(phone)) {
      //   this.setData({
      //     phoneNumber: phone
      //   });
      // }
      this.bindClearMsgEvent()
    },

    /**
     * 选择体验馆
    */
    bindSelectExprEvent: function(e) {
      let index = e.detail.value;
      let exprData = this.data.data_exprList;

      this.data.data_selectedExpr = exprData[index];
      this.data.data_selectedExpr.id = exprData[index].id;
      this.data.data_selectedExpr.txt = exprData[index].showTxt;
      
      this.setData({
        data_selectedExpr: this.data.data_selectedExpr
      });
      console.log('data_selectedExpr', this.data.data_selectedExpr)
    },

    /**
     * 获取图形验证码
    */
    bindGetImgCaptchaEvent: function() {
      this.data.captcha_img = $.util.getImgVerifyCode();
      this.setData({
        captcha_img: this.data.captcha_img
      });
    },

    /**
     * 预约接口
     * 发送请求到/dubbo_api/mll/crmImport/mServiceApply
     * 如果接口返回不需要图形验证码，则预约流程结束
     * 如果接口返回需要验证码，则显示图形验证码界面，填写完图形验证码，直接将图形验证码传入该接口，完成预约流程
    */
    _submitEvent: function(callback) {
      /*---------------------------------
         * @ 插入样式方法
         * @ param[type|num] 采集表类型,传0，商品详情页传1
         * @ param[sendType|num] 采集类型,家居顾问服务=50,门店服务=51,商品详情页70
         * @ param[captcha|string] 图形验证码，没有传""
         * @ param[mobile|string] 手机号
         * @ param[exprId|string] 体验馆ID
         * @ param[sendFrom|num] 来源,1=主站，2=手机站，3=APP
         * @ param[sysCode|string] sysCode 配置的免验证系统变量名，传service_captcha_limit
        -----------------------------------*/
      let _this = this;
      let regionInfo = this.data.regionInfo;
      let latitude = regionInfo.latitude;
      let longitude = regionInfo.longitude;
      let regionName = regionInfo.city_name;

      var submitData = {
        type: 0,
        sendType: 50,
        captcha: this.data.imgCapcha,
        mobile: this.data.phoneNumber,
        exprId: this.data.data_selectedExpr.id || '',
        sendFrom: 2,
        sysCode: 'service_captcha_limit',
        exprFrom: 1,//体验馆id来源 1为系统推荐 2为cookie 3为广告位指定id
        sysExprId: this.data.data_selectedExpr.id, //系统推荐的体验馆id  如果走cookie则为空
        regionId: regionInfo.city_id,
        sendContent: latitude + '|' + longitude + ',' + regionName //30.67994285|104.06792346,城市
      };

      $.ajax({
        url: $.config.REQUEST_URL + '/dubbo_api/mll/crmImport/mServiceApply',
        type: 'GET',
        dataType: 'json',
        data: submitData,
        success: function (res) {
          if (res.data) {console.log(res.data.error)
            if (res.data.error == 0 || res.data.error == 2) {
              callback(res.data);
            } else {
              _this.data.submitLock = false;
              _this.data.flag_step_form = false;
              _this.data.flag_step_success = true;
              _this.data.notice_msg = res.data.msg;

              _this.setData({
                submitLock: _this.data.submitLock,
                flag_step_form: _this.data.flag_step_form,
                flag_step_success: _this.data.flag_step_success,
                notice_msg: _this.data.notice_msg
              });
            }
          } else {
            _this.data.notice_msg = '有一点点小意外，请稍后重试！';
            _this.setData({
              notice_msg: _this.data.notice_msg
            });
            return false;
          }          
        },
        error: function () {
          _this.data.notice_msg = '有一点点小意外，请稍后重试！';
          _this.setData({
            notice_msg: _this.data.notice_msg
          });
        }
      })
    },

    /**
     * 预约按钮
    */
    bindOrderEvent: function() {
      if (this.data.submitLock) {
        return;
      }

      let _this = this;
      //需要验证码的情况
      if (!_this.data.flag_imgCaptcha){
        if (_this.data.imgCapcha){
          _this._submitEvent(function (json) {
            if (json.error == 0) {
              _this.data.submitLock = false;
              _this.data.flag_step_form = true;
              _this.data.flag_step_success = false;

              _this.setData({
                submitLock: _this.data.submitLock,
                flag_step_form: _this.data.flag_step_form,
                flag_step_success: _this.data.flag_step_success
              });

              _this._closeLayer();
            }
          });
        }else{
          _this.setData({
            notice_msg:'请输入验证码'
          })
        }
        return
      }
      let exprId = this.data.data_selectedExpr.id;

      let regionInfo = this.data.regionInfo;
      let latitude = regionInfo.latitude;
      let longitude = regionInfo.longitude;
      let regionId = regionInfo.city_id;
      let regionName = regionInfo.city_name;
      let captcha = _this.data.verifyCodeVal

      // if (regionInfo.phoneNumber) {
      //   this.setData({
      //     phoneNumber: regionInfo.phoneNumber,
      //     flag_phoneInput: false,
      //     flag_phoneInputDisabled: 'disabled'
      //   })
      // }
      let phone = this.data.phoneNumber;
      if (!(/^1\d{10}/.test(phone))) {
        this.data.notice_msg = '请输入正确手机号！';
        this.setData({
          notice_msg: this.data.notice_msg
        });
        return;
      }

      _this.data.submitLock = true;
      _this.setData({
        submitLock: _this.data.submitLock
      });

      this._submitEvent(function(json){
        if (json.error == 0) {
          _this.data.submitLock = false;
          _this.data.flag_step_form = true;
          _this.data.flag_step_success = false;
          _this.setData({
            submitLock: _this.data.submitLock,
            flag_step_form: _this.data.flag_step_form,
            flag_step_success: _this.data.flag_step_success
          });
          let strs = 'mall'
          if (wx.getStorageSync('SOURCE')) {
            strs = wx.getStorageSync('SOURCE')
          }
          $.track.push(['trackEvent', 'goods', '采集', strs +'_'+ _this.data.phoneNumber]);
          // $.track.push(['trackEvent', '预约服务顾问', 'success', phone]);

          _this._closeLayer();
        } else if (json.error == 2) { // 需要图形验证码
          _this.data.submitLock = false;
          _this.data.flag_step_form = false;
          _this.data.flag_step_success = true;
          _this.data.flag_imgCaptcha = false;
          _this.setData({
            submitLock: _this.data.submitLock,
            flag_step_form: _this.data.flag_step_form,
            flag_step_success: _this.data.flag_step_success,
            flag_imgCaptcha: _this.data.flag_imgCaptcha
          });
          _this.bindGetImgCaptchaEvent();
        }
      });
    },

    /**
     * 如果需要图形验证码
    */
    bindCheckImgCaptchaEvent: function(e) {
      let _this = this;
      let imgCaptch = e.detail.value;
      this.setData({
        imgCaptch: imgCaptch
      })
      // if (imgCaptch.length == 4) {
      //   this._submitEvent(function(json){
      //     if (json.error == 0) {
      //       _this.data.submitLock = false;
      //       _this.data.flag_step_form = true;
      //       _this.data.flag_step_success = false;

      //       _this.setData({
      //         submitLock: _this.data.submitLock,
      //         flag_step_form: _this.data.flag_step_form,
      //         flag_step_success: _this.data.flag_step_success
      //       });

      //       _this._closeLayer();
      //     } 
      //   });
      // }
      _this.setData({
        notice_msg:''
      })
    },

    /**
    * 清除消息提示
   */
    bindClearMsgEvent: function () {
      this.data.notice_msg = '';
      this.setData({
        notice_msg: this.data.notice_msg
      });
    },

    /**
     * 2秒后关闭图层
    */
    _closeLayer: function () {
      let _this = this;
      this.data.flag_visiblity = true;
      this.data.flag_step_form = false;
      this.data.flag_step_success = true;

      setTimeout(function () {
        _this.setData({
          flag_visiblity: _this.data.flag_visiblity,
          flag_step_form: _this.data.flag_step_form,
          flag_step_success: _this.data.flag_step_success
        })
      }, 2000);
    }
  }
});


