var commonCityData = require('../../utils/city.js')
const http = require('../../utils/http.js')  // 引入
const dialog = require('../../utils/dialog.js')  // 引入

//获取应用实例
var app = getApp()
Page({
  data: {
    provinces: [],
    citys: [],
    defaultProvinceCode: 2,
    defaultCityCode: 3,
    defaultCountyCode: 16,
    defaultAddressCode: '057750',
    districts: [],
    selProvince: '请选择',
    selCity: '请选择',
    selDistrict: '请选择',
    selProvinceIndex: 0,
    selCityIndex: 0,
    selDistrictIndex: 0
  },
  bindCancel: function () {
    wx.navigateBack({})
  },
  bindSave: function (e) {
    var that = this;
    var linkMan = e.detail.value.linkMan;
    var address = e.detail.value.address;
    var mobile = e.detail.value.mobile;
    var code = e.detail.value.code;
    var flag = e.detail.value.isDefault;
    var _isDefault = 'SW1002';
    if(flag){
      _isDefault = 'SW1001';
    } 

    if (linkMan == "") {
      dialog.dialog('提示', '请填写联系人姓名', false, '确定');
      return
    }
    if (mobile == "") {
      dialog.dialog('提示', '请填写手机号码', false, '确定');
      return
    }
    if (this.data.selProvince == "请选择") {
      dialog.dialog('提示', '请选择省份', false, '确定');
      return
    }
    if (this.data.selCity == "请选择") {
      dialog.dialog('提示', '请选择城市', false, '确定');
      return
    }
    var cityId = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].id;
    var districtId;
    if (this.data.selDistrict == "请选择" || !this.data.selDistrict) {
      districtId = '';
    } else {
      districtId = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].districtList[this.data.selDistrictIndex].id;
    }
    if (address == "") {
      dialog.dialog('提示', '请填写详细地址', false, '确定');
      return
    }
    if (code == "") {
      dialog.dialog('提示', '请填写邮编', false, '确定');
      return
    }
    var addOrUpdate = "add";
    var mark = '添加';
    var apiAddid = that.data.id;
    if (apiAddid) {
      addOrUpdate = "update";
      mark = '更新';
    } else {
      apiAddid = 0;
    }
    var param = {
      addOrUpdate: addOrUpdate,
      id: apiAddid,
      provinceId: commonCityData.cityData[this.data.selProvinceIndex].id,
      cityId: cityId,
      districtId: districtId,
      province: commonCityData.cityData[this.data.selProvinceIndex].name,
      city: commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].name,
      region: commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].districtList[this.data.selDistrictIndex].name,
      name: linkMan,
      detailAddress: address,
      phone: mobile,
      postCode: code,
      status: 'SW1302',
      isDefault: _isDefault,
      isSelect: _isDefault,
      openid: wx.getStorageSync('openid'),
      customerId: app.globalData.userInfo.id
    }
    http('/customerAddress/setAddress', param, null, 'post').then(res => {
      if(res.success){
        dialog.showToast(mark + '成功', 'success', '', 2000)
        wx.navigateBack({})
      } else {
        dialog.dialog('错误', '新增收货地址失败，请联系管理员!', false, '确定');
      }
    })
  },
  initCityData: function (level, obj) {
    if (level == 1) {
      var pinkArray = [];
      for (var i = 0; i < commonCityData.cityData.length; i++) {
        pinkArray.push(commonCityData.cityData[i].name);
      }
      this.setData({
        provinces: pinkArray
      });
    } else if (level == 2) {
      var pinkArray = [];
      var dataArray = obj.cityList
      for (var i = 0; i < dataArray.length; i++) {
        pinkArray.push(dataArray[i].name);
      }
      this.setData({
        citys: pinkArray
      });
    } else if (level == 3) {
      var pinkArray = [];
      var dataArray = obj.districtList
      for (var i = 0; i < dataArray.length; i++) {
        pinkArray.push(dataArray[i].name);
      }
      this.setData({
        districts: pinkArray
      });
    }

  },
  bindPickerProvinceChange: function (event) {
    var selIterm = commonCityData.cityData[event.detail.value];
    this.setData({
      selProvince: selIterm.name,
      selProvinceIndex: event.detail.value,
      selCity: '请选择',
      selCityIndex: 0,
      selDistrict: '请选择',
      selDistrictIndex: 0
    })
    this.initCityData(2, selIterm)
  },
  bindPickerCityChange: function (event) {
    var selIterm = commonCityData.cityData[this.data.selProvinceIndex].cityList[event.detail.value];
    this.setData({
      selCity: selIterm.name,
      selCityIndex: event.detail.value,
      selDistrict: '请选择',
      selDistrictIndex: 0
    })
    this.initCityData(3, selIterm)
  },
  bindPickerChange: function (event) {
    var selIterm = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].districtList[event.detail.value];
    if (selIterm && selIterm.name && event.detail.value) {
      this.setData({
        selDistrict: selIterm.name,
        selDistrictIndex: event.detail.value
      })
    }
  },
  onLoad: function (e) {
    var that = this;
    that.setData({ 
      navHeight: app.globalData.navHeight
    })
    this.initCityData(1);
    var id = e.id;  
    if (id) {
      // 初始化原数据
      wx.showLoading();
      http('/customerAddress/getAddress/'+id, null, null, 'get').then(res => {
        if (res.success) {
          that.setData({
            id: id,
            addressData: res.data,
            selProvince: res.data.province,
            selCity: res.data.city,
            selDistrict: res.data.region
          });
          that.setDBSaveAddressId(res.data);
          wx.hideLoading();
        } else {
          dialog.dialog('错误', '获取收货地址失败，请联系管理员!', false, '确定');
        }
      })
    }
  },
  setDBSaveAddressId: function (data) {
    var retSelIdx = 0;
    for (var i = 0; i < commonCityData.cityData.length; i++) {
      if (data.province == commonCityData.cityData[i].name) {
        this.data.selProvinceIndex = i;
        for (var j = 0; j < commonCityData.cityData[i].cityList.length; j++) {
          if (data.city == commonCityData.cityData[i].cityList[j].name) {
            this.data.selCityIndex = j;
            for (var k = 0; k < commonCityData.cityData[i].cityList[j].districtList.length; k++) {
              if (data.region == commonCityData.cityData[i].cityList[j].districtList[k].name) {
                this.data.selDistrictIndex = k;
              }
            }
          }
        }
      }
    }
  },
  selectCity: function () {

  },
  switchChange: function (e) {

  },
  deleteAddress: function (e) {
    var id = e.currentTarget.dataset.id;
    var param = {
      id: id
    }
    wx.showModal({
      title: '提示',
      content: '确定要删除该收货地址吗？',
      success: function (res) {
        if (res.confirm) {
          http("/customerAddress/deleteAddress", param, null, 'post').then(res => {
            if(res.success){
              wx.navigateBack({})
            }else{
              dialog.dialog('错误', res.message, false, '确定');
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  readFromWx: function () {
    let that = this;
    wx.chooseAddress({
      success: function (res) {
        console.log(res)
        let provinceName = res.provinceName;
        let cityName = res.cityName;
        let diatrictName = res.countyName;
        let retSelIdx = 0;
        for (var i = 0; i < commonCityData.cityData.length; i++) {
          if (provinceName == commonCityData.cityData[i].name) {
            let eventJ = { detail: { value: i } };
            that.bindPickerProvinceChange(eventJ);
            that.data.selProvinceIndex = i;
            for (var j = 0; j < commonCityData.cityData[i].cityList.length; j++) {
              if (cityName == commonCityData.cityData[i].cityList[j].name) {
                //that.data.selCityIndex = j;
                eventJ = { detail: { value: j } };
                that.bindPickerCityChange(eventJ);
                for (var k = 0; k < commonCityData.cityData[i].cityList[j].districtList.length; k++) {
                  if (diatrictName == commonCityData.cityData[i].cityList[j].districtList[k].name) {
                    //that.data.selDistrictIndex = k;
                    eventJ = { detail: { value: k } };
                    that.bindPickerChange(eventJ);
                  }
                }
              }
            }
          }
        }

        that.setData({
          wxaddress: res,
        });
      }
    })
  }
})
