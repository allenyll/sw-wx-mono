const http = require('../../utils/http.js')  // 引入
const dialog = require('../../utils/dialog.js')  // 引入

var app = getApp();

Page({
  data: {
    coupons: [],
    buyType: ''
  },
  onLoad: function (options) {
    this.setData({ 
      navHeight: app.globalData.navHeight,
      buyType: options.buyType
    })
    this.getCouponList()
  },

  getCouponList: function () {
    var that = this;
    var param = {
      customerId: app.globalData.userInfo.id
    }
    http('/coupon/getCouponList', param, null, 'post').then(res => {
      if (res.success) {
        const coupons = res.data.list;
        if (coupons.length > 0) {
          that.setData({
            coupons: coupons
          });
        }
      } else {
        dialog.dialog('错误', '获取优惠券失败', false, '确定');
      }
    });
  },

  onPullDownRefresh(){
      // 显示顶部刷新图标
      wx.showNavigationBarLoading();
      // 增加下拉刷新数据的功能
      var self = this;
    this.getCouponList();
      // 隐藏导航栏加载框
      wx.hideNavigationBarLoading();
      // 停止下拉动作
      wx.stopPullDownRefresh();
  },

  /**
   * 点击不使用优惠券
   * 返回上一页
   */
  noUseCoupon: function () {
    app.globalData.userCoupon = 'NO_USE_COUPON'
    wx.navigateBack({
    })
  },

  tapCoupon: function (event) {
    let item = event.currentTarget.dataset.item
    if (item.enabled==0) {
      return
    }
    app.globalData.userCoupon = 'USE_COUPON'
    app.globalData.courseCouponCode = item
    wx.navigateBack({
    })
  }
})