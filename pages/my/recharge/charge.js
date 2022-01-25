var wxpay = require('../../../utils/pay.js')
const dialog = require('../../../utils/dialog.js')  // 引入
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    uid: undefined,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      navHeight: app.globalData.navHeight
    })
    let recharge_amount_min = app.globalData.recharge_amount_min;
    if (!recharge_amount_min) {
      recharge_amount_min = 0;
    }
    this.setData({
      uid: wx.getStorageSync('uid'),
      recharge_amount_min: recharge_amount_min
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  bindCancel: function () {
    wx.navigateBack({})
  },
  bindSave: function (e) {
    var that = this;
    var amount = e.detail.value.amount;

    if (amount == "" || amount * 1 < 0) {
      dialog.dialog('错误', '请填写正确的充值金额!!!', false, '确定')
      return
    }
    if (amount * 1 < that.data.recharge_amount_min * 1) {
      dialog.dialog('错误', '单次充值金额至少' + that.data.recharge_amount_min + '元', false, '确定')
      return
    }
    wxpay.wxpay(app, amount, 0, '/pages/my/cash/cash', "charge");
  }
})