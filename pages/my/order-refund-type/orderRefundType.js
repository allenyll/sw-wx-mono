const http = require('../../../utils/http.js')  // 引入
const dialog = require('../../../utils/dialog.js')  // 引入
var app = getApp()
Page({
  data: {
    orderDetail: {
    }
  },

  clickRefund: function(e) {
    var type = e.currentTarget.dataset.type
    wx.navigateTo({
      url: '/pages/my/order-refund-detail/orderRefundDetail?param=' + JSON.stringify(this.data.orderDetail) + '&type=' + type,
    })
  },

  onLoad: function (options) {
    var that = this
    that.setData({ 
      navHeight: app.globalData.navHeight
    })
    let param = JSON.parse(options.param)
    that.setData({
      orderDetail: param
    })
  },

  onShow: function () {
  }
})