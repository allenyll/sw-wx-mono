const http = require('../../utils/http.js')  // 引入
var wxpay = require('../../utils/pay.js')
const dialog = require('../../utils/dialog.js')  // 引入

var app = getApp();
Page({
  data: {
    status: false,
    orderId: 0,
    transactionId: 0,
    money: 0
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({
      navHeight: app.globalData.navHeight,
      orderId: options.orderId,
      status: options.status === 'true' ? true : false,
      transactionId: options.transactionId,
      money: options.money //支付金额
    })
    if (this.data.status) {
      this.updateSuccess()
    }
  },
  onReady: function () {

  },
  onShow: function () {
    // 页面显示

  },
  onHide: function () {
    // 页面隐藏

  },
  onUnload: function () {
    // 页面关闭

  },
  
  updateSuccess: function () {
    http('/pay/query?orderId='+this.data.orderId+'&transactionId='+this.data.transactionId, null, null, 'post').then(res => {
    })
  },

  checkOrder() {
    wx.redirectTo({ 
      url: '/pages/my/order-list/order?id='+ escape(app.globalData.userInfo.id) + '&type=SW0700'
    });
  },

  payOrder() {
    wxpay.wxpay(app, this.data.money, this.data.orderId, '/pages/my/order-list/order', "order");
    this.setData({
      status: true
    })
  }
})