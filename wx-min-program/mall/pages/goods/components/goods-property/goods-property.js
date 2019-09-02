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
    goodsInfo: Object,

    // 商品数量
    num: Number
  },

  data: {
    // 选择商品规格
    flag_propertyVisiblity: true,
    // 滑动控制动画样式
    flag_propertyAnimation: 'slide-show',

    // 按钮图片
    image_numberIcon: {
      minus: ['../../../../statics/goods/minus_disable.png', '../../../../statics/goods/minus_able.png'],
      plus: ['../../../../statics/goods/plus_disable.png', '../../../../statics/goods/plus_able.png']
    },
    // 减少按钮样式
    flag_minusActive: false,
    // 增加按钮样式
    flag_plusActive: true,
    // 商品数量限制
    data_limitNUmber: 9999,

    // 弹出图层中的图片缩略图
    data_thumb: '',

    // 属性
    data_attr: [],
    // 原始数据，重置的时候使用
    data_originAttr: [],

    attrGoods: null,

    // 支持的类型
    data_attrCat: [],

    // 记录选中项
    attrSelectedData: {
      'type': '',
      'color': '',
      'material': ''
    },

    // 标记是否需要发送请求获取新的商品信息
    isNeedRequestGoodsInfo: false,

    // 是否需要隐藏购买按钮
    flag_hiddenShoppingBtn: true,
    //记录选择的商品信息
    selectGoodsData:[]
  },

  methods: {
    /**
     * 切换图层显示 
    */
    toggleProperyPanel: function() {
      let _this = this;
      let goods_id = this.data.goodsInfo.goods_id
      if (this.data.flag_propertyVisiblity) {
        this.data.flag_propertyVisiblity = false;
        this.data.flag_propertyAnimation = 'slide-show';

        if (this.data.num > 1) {
          this.data.flag_minusActive = true;
        }

        this.setData({
          flag_propertyVisiblity: this.data.flag_propertyVisiblity,
          flag_propertyAnimation: this.data.flag_propertyAnimation,
          data_attr: this._formartAttrData(this.data.goodsInfo.attr),
          data_originAttr: this._formartAttrData(this.data.goodsInfo.attr),
          attrGoods: this.data.goodsInfo.attr.goods || '',
          data_attrCat: this.data.goodsInfo.attr.attrs || [],
          flag_minusActive: this.data.flag_minusActive,
          data_thumb: app.globalData.imagesUrl +'/'+ this.data.goodsInfo.gallery[0],
          flag_hiddenShoppingBtn: (this.data.goodsInfo.is_can_buy == 0 ? true : false)
        });

        this.initAttrOptions(this.data.goodsInfo.attr);
      } else {
        this.data.flag_propertyVisiblity = true;        
        this.data.flag_propertyAnimation = 'slide-hide';

        this.triggerEvent('shoppingNumber', _this.data.num); 

        setTimeout(function () {
          _this.setData({
            flag_propertyVisiblity: _this.data.flag_propertyVisiblity
          });
        }, 200);
        let selectGoodsData = this.data.selectGoodsData
        if (selectGoodsData &&
          selectGoodsData.length == 1 &&
          goods_id != selectGoodsData[0].id){

          console.log('selectGoodsData', selectGoodsData)
          wx.redirectTo({
            url: '../../../goods?goods_id=' + selectGoodsData[0].id,
          })
        }
        this.setData({
          flag_propertyAnimation: this.data.flag_propertyAnimation
        });
      }     
    },

    /**
     * 格式化数据
    */
    _formartAttrData: function(attrData) {
      let attrDataTpl = [
        {
          'cat': 'type',
          'name': '类型',
          'list': (attrData.attr_types && attrData.attr_types.length > 0) ? attrData.attr_types :  false
        },
        {
          'cat': 'color',
          'name': '颜色',
          'list': (attrData.attr_colors && attrData.attr_colors.length > 0) ? attrData.attr_colors : false
        },
        {
          'cat': 'material',
          'name': '材质',
          'list': (attrData.attr_materials && attrData.attr_materials.length > 0) ? attrData.attr_materials : false
        }
      ];

      attrDataTpl.forEach(function(item){
        let tplArr = [];
        if (item.list) {
          let subData = item.list;
          subData.forEach(function(subItme){
            tplArr.push({
              name: subItme,
              selected: false,
              disabled: false
            });
          });
          item.list = tplArr;
        }
      });

      return attrDataTpl;
    },

    /**
     * 初始化选项状态
    */
    initAttrOptions: function(attrData) {
      this.data.attrSelectedData['type'] = attrData.current_attr ? attrData.current_attr : '';
      this.data.attrSelectedData['color'] = attrData.current_color ? attrData.current_color : '';
      this.data.attrSelectedData['material'] = attrData.current_material ? attrData.current_material : '';

      let _this = this;
      this.data.data_attrCat.forEach(function (item) {
        _this._filterList(item);
      });

      // 选中的数据
      this.data.data_attr.forEach(function (item) {
        let cat = item.cat;
        let selectedItem = _this.data.attrSelectedData[cat];
        let subData = item.list;
        if (!subData){
          return
        }
        subData.forEach(function (subItem) {
          if (subItem.name == selectedItem) {
            subItem.selected = true;

            if (cat == 'type') {
              _this.data.attrSelectedData['type'] = subItem.name;
            } else if (cat == 'color') {
              _this.data.attrSelectedData['color'] = subItem.name;
            } else {
              _this.data.attrSelectedData['material'] = subItem.name;
            }
          }
        });
      });

      this.setData({
        data_attr: this.data.data_attr,
        attrSelectedData: this.data.attrSelectedData,
        availableItemList: true
      });
    },

    /**
     * 选项点击事件
    */
    bindSelectEvent: function(e) {
      let cat = e.currentTarget.dataset.cat;
      let itemName = e.currentTarget.dataset.name;
      let catOrder = e.currentTarget.dataset.cat_order;
      let itemOrder = e.currentTarget.dataset.item_order;

      // 如果选项为不可选状态，则不继续
      if (this.data.data_attr[catOrder].list[itemOrder].disabled) {
        return;
      }

      // 取消同类型中的所有选中项
      this.data.data_attr[catOrder].list.forEach(function(item){
        if (item.name != itemName) {
          item.selected = false;
        }
      });

      if (this.data.data_attr[catOrder].list[itemOrder].selected) {
        this.data.data_attr[catOrder].list[itemOrder].selected = false;

        if (cat == 'type') {
          this.data.attrSelectedData['type'] = '';
        } else if (cat == 'color') {
          this.data.attrSelectedData['color'] = '';
        } else {
          this.data.attrSelectedData['material'] = '';
        }
      } else {
        this.data.data_attr[catOrder].list[itemOrder].selected = true;

        if (cat == 'type') {
          this.data.attrSelectedData['type'] = itemName;
        } else if (cat == 'color') {
          this.data.attrSelectedData['color'] = itemName;
        } else {
          this.data.attrSelectedData['material'] = itemName;
        }
      }
      
      this._filterList(cat);

      this.setData({
        data_attr: this.data.data_attr,
        attrSelectedData: this.data.attrSelectedData
      });
    },

    /**
     * 查询可用的选项
     * param queryType string 要查询的类型
     * param queryColor string 要查询的颜色
     * param queryMaterial string 要查询的规格
    */
    _queryAvailableOptions: function (queryType, queryColor, queryMaterial) {
      var retGoods = {};
      var 
        availableTypeList = {},
        availableColorList = {},
        availableMaterialList = {},
        availableGoodsList = [];

      var attrGoodsList = this.data.attrGoods;

      attrGoodsList.forEach(function(item){
        let actualType = item.type ? item.type : "";
        let actualColor = item.color ? item.color : "";
        let actualMaterial = item.material ? item.material : "";

        let filterType = queryType ? queryType : actualType;
        let filterColor = queryColor ? queryColor : actualColor;
        let filterMaterial = queryMaterial ? queryMaterial : actualMaterial;

        if (actualType == filterType && actualColor == filterColor && actualMaterial == filterMaterial) {
          availableTypeList[actualType] = 1;
          availableColorList[actualColor] = 1;
          availableMaterialList[actualMaterial] = 1;
          availableGoodsList.push(item);
        }
      })

      retGoods['type'] = availableTypeList;
      retGoods['color'] = availableColorList;
      retGoods['material'] = availableMaterialList;
      retGoods['list'] = availableGoodsList;

      return retGoods;
    },

    /**
     * 过滤选项
     * param itemType object 选中项
    */
    _filterList: function (itemType) {
      let selectType = this.data.attrSelectedData['type'];
      let selectColor = this.data.attrSelectedData['color'];
      let selectMaterial = this.data.attrSelectedData['material'];

      var availableTypeList = this._queryAvailableOptions('', selectColor, selectMaterial).type;
      var availableColorList = this._queryAvailableOptions(selectType, '', selectMaterial).color;
      var availableMaterialList = this._queryAvailableOptions(selectType, selectColor, '').material;
      var availableItemList = this._queryAvailableOptions(selectType, selectColor, selectMaterial).list;
      console.log('availableItemList', availableItemList)
      var itemAvailableListMap = {};
      itemAvailableListMap['type'] = availableTypeList;
      itemAvailableListMap['color'] = availableColorList;
      itemAvailableListMap['material'] = availableMaterialList;

      if (this.data.availableItemList && availableItemList && availableItemList.length == 1) {
        this._getMergeGoodsInfo(availableItemList[0]);
      }
      let attrDataTpl = this.data.data_attr;
      attrDataTpl.forEach(function (item) {
        let cat = item.cat;
        let catName = item.name;
        let subData = item.list; 
        if (!subData) {
          return;
        }
        subData.forEach(function(subItem){
          let subItemName = subItem.name; 
          if (!itemAvailableListMap[cat][subItemName]) {
            if (itemType != cat) {
              subItem.disabled = true;
            }
          } else {
            subItem.disabled = false;
          }
        });
      });

      this.setData({
        data_attr: attrDataTpl,
        selectGoodsData: availableItemList
      });
    },

    /**
     * 获取组合后的商品信息
    */
    _getMergeGoodsInfo: function(goodsObj) {
      if (!goodsObj.id) {
        return;
      }

      let _this = this;

      $.ajax({
        url: app.globalData.Login_url+'mob_api/goods_colortype?goods_id=' + goodsObj.id,
        dataType: 'json',
        method: 'GET',
        success: function (res) {
          if (res && res.data) {
            let dataTpl = res.data;

            _this.data.goodsInfo.brand = dataTpl.goods_title_brand;
            _this.data.goodsInfo.style = dataTpl.goods_title_style;
            _this.data.goodsInfo.title = dataTpl.goods_title_name;
            _this.data.goodsInfo.effect_price = dataTpl.effect_price;

            _this.setData({
              goodsInfo: _this.data.goodsInfo,
              data_thumb: 'https:' + dataTpl.img
            });
          }
        }
      })
    },

    /**
     * 商品数量事件
    */
    bindChangeGoodsNumEVent: function (e) {
      let label = parseInt(e.currentTarget.dataset.label);
      if (this.data.num <= 1 && label == -1){
        return
      }
      this.data.num += label;

      if (this.data.num > 1) {
        this.data.flag_minusActive = true;
      } else {
        this.data.flag_minusActive = false;
      }

      if (this.data.num >= this.data.data_limitNUmber) {
        this.data.num = this.data.data_limitNUmber;
        this.data.flag_plusActive = false;
      } else {
        this.data.flag_plusActive = true;
      }
      this.triggerEvent('shoppingNumber', this.data.num);
      this.setData({
        num: this.data.num,
        flag_minusActive: this.data.flag_minusActive,
        flag_plusActive: this.data.flag_plusActive

      });
    },

    /**
     * 重置事件
    */
    bindResetEvent: function() {
      // 深度拷贝，如果直接将this.data.data_originAttr赋给data_arr
      // 后续在操作data_attr的同时，会影响data_originAttr的值
      let copyData = JSON.parse(JSON.stringify(this.data.data_originAttr));

      this.data.num = 1;

      this.triggerEvent('shoppingNumber', this.data.num);

      this.setData({
        data_attr: copyData,
        num: this.data.num,
        flag_minusActive:false
      });
    },

    /**
     * 立即购买
    */
    bindBuyEvent: function() {
      this.triggerEvent('buyEvent', this.data.num); 
    }
  }
});


