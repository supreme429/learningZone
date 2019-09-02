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

    // 图层显示控制
    flag_visiblity: true,

    // step1:获取用户授权手机号码、选择体验馆、图形验证码
    flag_step_form: false,
    // step2:提交结果反馈
    flag_step_success: true,

    // 获取手机号码按钮
    flag_phoneButton: false,
    // 填写手机号输入框
    flag_phoneInput: true,
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
    buttonTxt: '发送至微信绑定手机号',
    imgCode:''
  },

  methods: {
    /**
     * 切换图层显示 
    */
    toggleAddressPanel: function () {
      this.setData({
        phoneNumber:'',
        imgCode:'',
        imgCapcha:''
      })
      if (!this.data.flag_step_success){
        this.setData({
          flag_step_form:true
        })
      }
      if (this.data.flag_visiblity) {
        this.data.flag_visiblity = false;
        this.getExprListByDistance();
        this._checkPhoneInStorage();
      } else {
        this.data.flag_visiblity = true;
      }

      this.setData({
        flag_visiblity: this.data.flag_visiblity,
        flag_imgCaptcha:true,
        notice_msg:''
      })
    },

    /**
     * 获取周边200公里以内的体验馆
    */
    getExprListByDistance: function () {
      let _this = this;
      let latitude = this.data.regionInfo.latitude;
      let longitude = this.data.regionInfo.longitude;

      $.ajax({
        url: requestPrefix + '/goods/location/getExprListByDistance/?latitude=' + latitude + '&longitude=' + longitude + '&distance=200&iVersion=1.0',
        dataType: 'json',
        method: 'GET',
        success: function (res) {
          console.log('定位', latitude, longitude)
          let data_arr = []
          if (res && res.data) {
            let exprData = res.data.data;
            let exprList = [];

            exprData.forEach(function (item) {
              let distans = (item.distance / 1000).toFixed(2);
              item.showTxt = item.name + ' 距离您约' + distans + 'km';
              data_arr.push(item.showTxt);
            });

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
    _checkPhoneInStorage: function() {
      let phone = wx.getStorageSync('phoneNumber');
      if (phone) {
        this.data.phoneNumber = phone;
        this.data.flag_phoneButton = true;
        this.data.flag_phoneInput = false;
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
    bindGetUserPhoneEvent: function (e) {
      let msg = e.detail.errMsg;
      console.log(msg)
      let that = this;
      if (msg.match(/fail/)) {
        this.setData({
          flag_phoneButton: true,
          flag_phoneInput: false
        });
      } else {
        this.setData({
          flag_phoneButton: true,
          flag_phoneInput: false
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
                flag_phoneInput: false,
                notice_msg: ''
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
    getUserInputPhoneevent: function (e) {
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
    bindSelectExprEvent: function (e) {
      let index = e.detail.value;
      let exprData = this.data.data_exprList;

      this.data.data_selectedExpr = exprData[index];
      this.data.data_selectedExpr.id = exprData[index].id;
      this.data.data_selectedExpr.txt = exprData[index].showTxt;

      this.setData({
        data_selectedExpr: this.data.data_selectedExpr
      });

    },

    /**
     * 获取图形验证码
    */
    bindGetImgCaptchaEvent: function () {
      this.data.captcha_img = $.util.getImgVerifyCode();
      this.setData({
        captcha_img: this.data.captcha_img
      });
    },

    /**
     * 提交
     * 不需要图形验证码
    */
    bindOrderEvent: function () {
      let _this = this;
      let imgcode = this.data.imgCode
      if (this.data.submitLock) {
        return;
      }
      if (!(/^1[34578]\d{9}$/).test(this.data.phoneNumber)){
        this.setData({
          notice_msg:'请输正确手机号'
        })
        return
      }
      
      if (!this.data.flag_imgCaptcha) {//需要输验证码
        if (!imgcode){
          _this.setData({
            notice_msg:'请输入验证码'
          })
          return
        }
        // _this._inputImgCaptchaSubmit(imgcode)
        // return
      }
      let regionInfo = this.data.regionInfo;
      let latitude = regionInfo.latitude;
      let longitude = regionInfo.longitude;
      let regionName = regionInfo.city_name;

      var tmpData = {
        mobile: this.data.phoneNumber,
        exprId: _this.data.data_selectedExpr.id,
        // busniessType: 'm_expr_adrees',
        captcha: imgcode,
        // send_from: '',
        sendSource: 7,
        exprFrom: 3,//体验馆id来源 1为系统推荐 2为cookie 3为广告位指定id
        sysExprId: _this.data.data_selectedExpr.id, //系统推荐的体验馆id  如果走cookie则为空
        defaultCityId : regionInfo.city_id,
        sendContent: latitude + '|' + longitude + ',' + regionName //30.67994285|104.06792346,城市
      }

      _this.data.submitLock = true;
      _this.setData({
        submitLock: _this.data.submitLock
      });

      $.ajax({
        url: $.config.REQUEST_URL + '/dubbo_api/mll/exprFacade/exprAddress',
        data: tmpData,
        method: 'POST',
        header: { "content-Type": "application/x-www-form-urlencoded" },
        dataType: 'json',
        success: function(res) {
          if (res.data.error == 0) {

            _this.data.submitLock = false;
            _this.data.flag_step_form = true;
            _this.data.flag_step_success = false;

            _this.setData({
              submitLock: _this.data.submitLock,
              flag_step_form: _this.data.flag_step_form,
              flag_step_success: _this.data.flag_step_success
            });
            let strs = 'mall'
            if (wx.getStorageSync('SOURCE')){
              strs = wx.getStorageSync('SOURCE')
            }
            $.track.push(['trackEvent', 'goods', '采集', strs + '_' +_this.data.phoneNumber]);
            // $.track.push(['trackEvent', '获取体验馆', 'success', _this.data.phoneNumber]);

            _this._closeLayer();
          } else if (res.data.error == 2) {
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
          } else {
            _this.data.notice_msg = res.data.msg;
            _this.setData({
              notice_msg: _this.data.notice_msg,
              submitLock:false
            });
            return false;
          }
        },
        fail: function() {
          _this.data.notice_msg = '有一点点小意外，请稍后重试！';
          _this.setData({
            notice_msg: _this.data.notice_msg,
            submitLock:false
          });
        }
      });
    },

    /**
     * 如果需要图形验证码
     * 验证码输入完成后直接提交
    */
    bindCheckImgCaptchaEvent: function (e) {
      let _this = this;
      this.setData({
        imgCode: e.detail.value
      })
      _this.bindClearMsgEvent()
    },

    /**
     * 输入验证码提交
    */
    _inputImgCaptchaSubmit: function(codes) {
      let _this = this
      let regionInfo = this.data.regionInfo;
      let latitude = regionInfo.latitude;
      let longitude = regionInfo.longitude;
      let regionName = regionInfo.city_name;
      let imgCaptch = codes
      let requestUrl = $.config.REQUEST_URL + '/solr_api/jmll/expr/getExprAddr.do?send_source=2&type=m_expr_addrees&expr_id=' + _this.data.data_selectedExpr.id + '&mobile=' + _this.data.phoneNumber + '&captcha=' + imgCaptch + '&url=&send_from=&exprFrom=3&sysExprId=' + _this.data.data_selectedExpr.id + ' & regionId=' + regionInfo.city_id + ' & sendContent=' + (latitude + '|' + longitude + ',' + regionName);

      $.ajax({
        url: requestUrl,
        method: 'GET',
        dataType: 'json',
        success: function(res) {
          if (res.data.error == 0) {
            _this.data.flag_step_form = true;
            _this.data.flag_step_success = false;

            _this.setData({
              flag_step_form: _this.data.flag_step_form,
              flag_step_success: _this.data.flag_step_success,
              imgCapcha: ''
            });

            _this._closeLayer();
          } else {
            _this.data.notice_msg = res.data.msg;
            _this.setData({
              notice_msg: _this.data.notice_msg,
              imgCapcha: ''
            });
            return false;
          }
        },
        fail: function() {
          _this.data.notice_msg = '有一点点小意外，请稍后重试！';
          _this.setData({
            notice_msg: _this.data.notice_msg,
            imgCapcha: ''
          });
        }
      });
    },

    /**
    * 清除消息提示
   */
    bindClearMsgEvent: function () {
      this.setData({
        notice_msg: ''
      });
    },

    /**
     * 3秒后关闭图层
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
      }, 3000);
    }
  }
});


