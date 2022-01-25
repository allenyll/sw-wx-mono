const http = require('../../../utils/http.js')  // 引入
const dialog = require('../../../utils/dialog.js')  // 引入
var app = getApp();

Page({
  data: {
  },
  onLoad: function (options) {
    this.setData({ 
      navHeight: app.globalData.navHeight
    })
  },
  onReady: function () {

  },
  onShow: function () {

  },
  onHide: function () {
    // 页面隐藏

  },
  onUnload: function () {
    // 页面关闭
  }
})