// components/activitiesAddress/activitiesAddress.js
const quick = require('../../utils/quick.js')
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
    provinces: [],
    citys: [],
    districts: [],  
    province: 0,
    city: 0,
    district: 0,
    value: [0, 0, 0],
    provinceId: '',
    districtId: '',
    cityId: '',
  },

  //生命周期
  attached: function(){
    this.getProvinceData(1);
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //获取省数据
    getProvinceData: function (regionId){
      this.getData(regionId, response => {
        this.setData({
          province: 0,
          provinces: response,
          provinceId: response[0].region_id,
        })
        this.getCityData(response[0].region_id)
      });
    },
    // 获取市数据
    getCityData(regionId) {
      this.getData(regionId, response => {
        this.setData({
          city: 0,
          citys: response,
          cityId: response[0].region_id,
        })
        this.getDistrictData(response[0].region_id)
      });
    },

    // 获取区数据
    getDistrictData(regionId) {
      this.getData(regionId, response => {
        this.setData({
          district: 0,
          districts: response,
          districtId: response[0].region_id,
        })
      });
    },

    getData(regionId, callback) {
      var requectUrl = { url: 'getRegionData' };
      var requestData = { regionId };
      quick.requestGet(requectUrl, requestData).then(res => {
        if (!res.data.code) {
          var response = JSON.parse(res.data.data);
          callback(response);
        }
      })
    },

    bindChange: function (e) {
      const val = e.detail.value
      if (this.data.province !== val[0]){
        this.setData({
          province: val[0],
          provinceId: this.data.provinces[val[0]].region_id
        })
        this.getCityData(this.data.provinceId)
      } else if (this.data.city !== val[1]){
        this.setData({
          city: val[1],
          cityId: this.data.citys[val[1]].region_id
        })
        this.getDistrictData(this.data.cityId)
      }else{
        this.setData({
          district: val[2],
          districtId: this.data.districts[val[2]].region_id
        })
      }
    },

    toggle() {
      this.triggerEvent('toggleAddress')
    },
    //保存选择
    saveAddress(){
      var addressDetail = { // detail对象，提供给事件监听函数
        provinceId: this.data.provinceId,
        provinceName: this.data.provinces[this.data.province].region_name,
        districtId: this.data.districtId,
        districtName: this.data.districts[this.data.district].region_name,
        cityId: this.data.cityId,
        cityName: this.data.citys[this.data.city].region_name,
      }
      this.triggerEvent('saveAddress', addressDetail)
      this.triggerEvent('toggleAddress')
    },

    move(e) {
      return false;
    }
  }, 
})
