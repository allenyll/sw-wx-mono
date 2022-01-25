var amapFile = require('../../../lib/amap-wx.js');  //引入高德js
var QQMapWX = require('../../../lib/qqmap-wx-jssdk.js');
var config = require('../../../lib/config.js');      //引用我们的配置文件
var app = getApp();
Page({
  data: {
    markers: [],
    latitude: 32.026137,
    longitude: 118.798524,
    location: 32.026137 + "," + 118.798524,
    textData: {
      name: '南京环北批发市场二期二楼338',
      desc: '江苏省南京市秦淮区白下路368号'
    }
  },
  onLoad: function () {
    this.setData({ 
      navHeight: app.globalData.navHeight
    })
  },
  onShow: function () {
    var that = this;
    var key = config.config.qqMapKey;
    var qqmapsdk = new QQMapWX({ key: key });
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: that.data.latitude,
        longitude: that.data.longitude
      },
      success: function(res) {
        var res = res.result;
        var mks = [];
        //当get_poi为0时或者为不填默认值时，检索目标位置，按需使用
        mks.push({ // 获取返回结果，放到mks数组中
          title: res.address,
          id: 0,
          latitude: res.location.lat,
          longitude: res.location.lng,
          iconPath: '../../images/marker.png',//图标路径
          width: 32,
          height: 32,
          callout: { //在markers上展示地址名称，根据需求是否需要
            content: res.address,
            color: '#000',
            display: 'ALWAYS'
          }
        });
        that.setData({ //设置markers属性和地图位置poi，将结果在地图展示
          markers: mks,
          poi: {
            latitude: res.location.lat,
            longitude: res.location.lng
          }
        });
      }
    })
  }
})

