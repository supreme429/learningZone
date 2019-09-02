// pages/address/addEdit/addEdit.js
const app = getApp();
const $ = global;
const requestPrefix = app.globalData.domain;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    errorIsHidden: true,
    errorText: '',
    // 收货人输入框文案
    nameInputText: '',
    // 联系方式输入框文案
    phoneInputText: '',
    // 详细地址输入框文案
    addressInputText: '',
    // 所在地区输入框文案
    areaInputText: '',
    // 所在地区输入框id
    areaInputId: '',
    // 地址列二维数组
    regionArray: [[],[],[]],
    // 区域缓存数据
    areaCacheList: {},
    // 首次打开地址选择标记
    firstOpen: true,
    // 是否是编辑
    isEdit: false,
    addressId: '',
    regionIndex: [0, 0, 0],
    // 是否是从确认订单页过来的
    isFromOrder: false,
    // 提交按钮锁定状态
    submitLock: false
  },

  onLoad(options) {
    // 判断是否是编辑进来的
    if (options.addressId) {
      this.setData({
        isEdit: true,
        addressId: options.addressId,
      }); 
    }

    // 判断是否是确认订单过来
    let isFromOrder = options.types && options.types == 'FromOrder';
    if (isFromOrder) {
      this.setData({
        isFromOrder: isFromOrder
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    if (this.data.isEdit) {
      // 请求地址信息
      $.ajax({
        url: `${requestPrefix}/user/XcxUser/address_detail/`,
        data: {
          address_id: this.data.addressId
        },
        success: (result) => {
          if (result.statusCode == 200) {
            if (result.data.code == 200) {
              let data = result.data.data[0],
                areaInputIdArr = [data.province, data.city, data.district],
                requestIdArr = ['1', areaInputIdArr[0], areaInputIdArr[1]];
              for (let i = 0, len = requestIdArr.length; i < len; i++) {
                this.getRegionData(requestIdArr[i], (regionList) => {
                  // 设置每列的选中位置
                  // 获得当前列中的选中项的index
                  let columnIndex = 0;
                  for (let j = 0, lenR = regionList.length; j < lenR; j++) {
                    if (regionList[j].region_id == areaInputIdArr[i]) {
                      columnIndex = j;
                    }
                  }

                  this.data.regionIndex[i] = columnIndex;
                  this.data.regionArray[i] = regionList;
                  this.setData({
                    regionIndex: this.data.regionIndex,
                    regionArray: this.data.regionArray
                  });
                });
              }

              this.setData({
                nameInputText: data.consignee,
                phoneInputText: data.mobile,
                areaInputText: `${data.province_name} ${data.city_name} ${data.region_name}`,
                areaInputId: `${data.province}-${data.city}-${data.district}`,
                addressInputText: data.address
              });
            }
          }
        }
      });
    } else {
      //获取省数据
      this.getRegionData('1', (provinceList) => {
        this.data.regionArray[0] = provinceList;
        this.setData({
          regionArray: this.data.regionArray
        });
      });
    }
  },
  columnChange(event) {
    let column = event.detail.column,
        columnIndex = event.detail.value,
        parentId = this.data.regionArray[column][columnIndex] && this.data.regionArray[column][columnIndex].region_id;

    //将当前列后面的列的数据删除
    for (let i = 0, len = this.data.regionArray.length; i < len; i++) {
      if (i > column) {
        this.data.regionArray[i] = [];
        this.data.regionIndex[i] = 0;
      }
    }

    //改变regionIndex的值
    this.data.regionIndex[column] = columnIndex;

    // 改变地区input选中的值
    let areaInputText = [],
      areaInputId = [];
    for (let i = 0, len = this.data.regionIndex.length; i < len; i++) {
      let value = this.data.regionArray[i][this.data.regionIndex[i]];

      if (value && value.region_id) {
        areaInputText.push(value.region_name);
        areaInputId.push(value.region_id);
      }
    }

    this.setData({
      areaInputText: areaInputText.join(' '),
      areaInputId: areaInputId.join('-'),
      regionIndex: this.data.regionIndex,
      regionArray: this.data.regionArray
    });
 
    // 没有parentId，不请求数据
    if (parentId) {
      // 操作的最后一列，不请求数据
      if (column >= 2) {
        return;
      }

      this.getRegionData(parentId, (regionList) => {
        this.data.regionArray[column + 1] = regionList;
        this.setData({
          regionArray: this.data.regionArray
        });
      });
    }
  },
  /**
   * 获取某个parentId下面的数据
   * @param {string} parentId
   * @param {function} callback
   */
  getRegionData(parentId, callback = function() {}) {
    if (!parentId) return;

    // 先到缓存中取，没有再到接口取
    if (this.data.areaCacheList[parentId] && this.data.areaCacheList[parentId].length) {
      callback(this.data.areaCacheList[parentId]);
    } else {
      wx.showLoading({
        title: '数据加载中'
      });

      $.ajax({
        url: `${requestPrefix}/user/XcxUser/address_region/`,
        data: {
          parent_id: parentId,
          iVersion: '1.0'
        },
        dataType: 'json',
        success: (result) => {
          var data = result.data;

          setTimeout(function () {
            wx.hideLoading();
          }, 500);

          if (result.statusCode == 200 && data.code == 200) {
          // if (1) {
            // 每列顶部添加一个请选择选项
            data.data.unshift({region_id: null, region_name: '请选择'});
            callback(data.data);

            // 缓存数据
            this.setData({
              [`areaCacheList.${parentId}`]: data.data
            });
          } else {
            // 接口出错提示 TODO
          }
        },
        fail: () => {
          wx.hideLoading();
        }
      });
    }
  },
  /**
   * 表单提交
   */
  addressFormSubmit(e) {
    if (this.data.submitLock) {
      return;
    }

    let formData = e.detail.value,
      name = formData.name,
      phone = formData.phone,
      areaId = formData.areaId.split('-'),
      address = formData.address;

    if (!name) {
      this.setData({
        errorIsHidden: false,
        errorText: '请输入收货人姓名！'
      });

      return;      
    }

    if (!phone) {
      this.setData({
        errorIsHidden: false,
        errorText: '请输入联系方式！'
      });

      return;
    }

    if (!/^1\d{10}/g.test(phone)) {
      this.setData({
        errorIsHidden: false,
        errorText: '手机号格式错误！'
      });

      return;
    }

    if (areaId.length < 3) {
      this.setData({
        errorIsHidden: false,
        errorText: '请选择所在地区！'
      });

      return;
    }

    if (address.length < 5) {
      this.setData({
        errorIsHidden: false,
        errorText: '详细地址不能少于5个字！'
      });

      return;
    }

    this.setData({
      errorIsHidden: true,
      errorText: '',
      submitLock: true
    });

    $.ajax({
      url: `${app.globalData.Login_url}core_api/Order/apisaveAddress/`,
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        name: name,
        phone: phone,
        province: areaId[0],
        city: areaId[1],
        district: areaId[2],
        address: address,
        custom_district: 0,
        expr: '',
        address_id: this.data.addressId
      },
      dataType: 'json',
      success: (result) => {
        if (result.statusCode == 200) {
          if (result.data.error == 0) {
            // wx.navigateBack();
            // 如果是确认订单页过来，并且是新增
            if (this.data.isFromOrder && !this.data.isEdit) {
              // 将新增的地址设置为默认地址
              $.ajax({
                url: `${app.globalData.Login_url}add_cart/?step=setDefaultConsignee`,
                data: {
                  address_id: result.data.data
                },
                success: (result) => {
                  if (result.statusCode == 200) {
                    if (result.data.error == 0) {
                      // 获取当前栈数组
                      let pageArr = getCurrentPages();
                      // 循环页面栈，计算返回到订单结算页需要几步
                      for (let i = 0, len = pageArr.length; i < len; i++) {
                        if (pageArr[i].route == 'pages/confirm-order/confirm-order') {
                          wx.navigateBack({
                            delta: len - 1 - i
                          });

                          break;
                        }
                      }
                    }
                  }
                }
              });
            } else {
              wx.showToast({
                mask: true,
                duration: 1000,
                title: this.data.isEdit ? '修改成功！' : '添加成功！'
              });

              setTimeout(function () {
                wx.navigateBack({
                  delta: 1
                });
              }, 1000);
            }

            return; 
          }

          return;
        }

        this.setData({
          submitLock: false
        });
      },
      fail: () => {
        this.setData({
          submitLock: false
        });
      }
    });
  },
  /**
   * 输入框事件
   */
  inputHandle(e) {
    let inputType = e.currentTarget.dataset.inputType;

    if (inputType == 'phone') {
      e.detail.value = e.detail.value.slice(0, 11);
    }

    this.setData({
      [inputType + 'InputText']: e.detail.value
    });
  },
  /**
   * 清空输入框事件
   */
  clearInput(e) {
    let inputType = e.currentTarget.dataset.inputType;

    this.setData({
      [inputType + 'InputText']: '',
      [inputType + 'InputFocus']: true
    });
  },

  onShow: function() {
    // 调用跟踪代码
    $.track.push(['trackView']);
  }
})