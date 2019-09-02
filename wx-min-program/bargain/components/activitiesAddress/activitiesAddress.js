// components/activitiesAddress/activitiesAddress.js
const quick = require('../../utils/quick.js');
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    sku: String
  },

  /**
   * 组件的初始数据
   */
  data: {
    provinces: [],
    citys: [],
    districts: [],
    province: 0,
    city: 0,
    district: 0,
    value: [0, 0, 0],
    provinceId: '',
    cityId: '',
    districtId: '',
  },

  //生命周期
  attached: function () {
    this.getProvinceData(1);
  },


  /**
   * 组件的方法列表
   */
  methods: {
    // 获取省数据
    getProvinceData(regionId) {
      this.getData(regionId, response => {
        this.setData({
          province: 0,
          provinces: response,
          provinceId: response[0].regionId
        })
        this.getCityData(response[0].regionId)
      });
    },

    // 获取市数据
    getCityData(regionId) {
      this.getData(regionId, response => {
        this.setData({
          city: 0,
          citys: response,
          cityId: response[0].regionId
        })
        this.getDistrictData(response[0].regionId)
      });
    },

    // 获取区数据
    getDistrictData(regionId) {
      this.getData(regionId, response => {
        this.setData({
          district: 0,
          districts: response,
          districtId: response[0].regionId
        })
      });
    },

    getData(regionId, callback) {
      var self = this;
      var requectUrl = {
        url: 'getRegionData',
      }
      var requestData = { 
        countryId: 1,
        provinceId: this.data.provinceId || 0,
        cityId: this.data.cityId || 0,
        goodsSkuSn: this.properties.sku 
      };
      quick.requestGet(requectUrl, requestData).then(res => {
        if (!res.data.code) {
          var response = res.data.data;
          callback(response);
        }
      })
    },

    bindChange: function (e) {
      const val = e.detail.value
      if (this.data.province !== val[0]) {
        this.setData({
          province: val[0],
          provinceId: this.data.provinces[val[0]].regionId,
          cityId: 0,
        })
        this.getCityData(this.data.provinceId)
      } else if (this.data.city !== val[1]) {
        this.setData({
          city: val[1],
          cityId: this.data.citys[val[1]].regionId,
          districtId: 0
        })
        this.getDistrictData(this.data.cityId)
      } else {
        this.setData({
          district: val[2],
          districtId: this.data.districts[val[2]].regionId
        })
      }
    },

    toggle() {
      this.triggerEvent('toggle')
    },

    save() {
      const addressDetail = { // detail对象，提供给事件监听函数
        provinceId: this.data.provinceId,
        province: this.data.provinces[this.data.province].regionName,
        cityId: this.data.cityId,
        city: this.data.citys[this.data.city].regionName,
        districtId: this.data.districtId,
        district: this.data.districts[this.data.district].regionName,
      }
      this.triggerEvent('save', addressDetail);
      this.toggle();
    }
  },
})
