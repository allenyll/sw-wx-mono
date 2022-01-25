//index.js
const http = require('../../../utils/http.js')  // 引入
//获取应用实例
var app = getApp()
Page({
  data: {
    id: '', // 用户ID
    images: '',
    items: [],
    balance: 0
  },
  onLoad: function (options) {
    this.setData({
      navHeight: app.globalData.navHeight,
      id: unescape(options.id)
    })
    this.getBalance()
  },

  // 获得余额详情数据
  getBalance: function () {
    let that = this;
    var param = {
      customerId: app.globalData.userInfo.id
    }
    http('/customerBalance/getBalance', param, '', 'POST').then(res => {
      if (res.success) {
        that.setData({
          balance: Number(res.data.customerBalance.balance)
        })
      }
    })
  },

  clickCharge: function () {
    wx.navigateTo({
      url: '/pages/my/recharge/charge',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },

  /**
   * 收支明细页面
   */
  clickBalanceDetail: function () {
    var that = this;
    if (that.data.hasUserInfo == false) {
      wx.navigateTo({
        url: '/pages/login/login?mark=/pages/my/cash/balancedetail/balancedetail',
      })
    } else {
      wx.navigateTo({
        url: '/pages/my/cash/balancedetail/balancedetail?id=' + escape(app.globalData.userInfo.id),
      })
    }
  },
})