var app = getApp();
var WxParse = require('../../lib/wxParse/wxParse.js');
const http = require('../../utils/http.js')  // 引入
const dialog = require('../../utils/dialog.js')  // 引入
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setData({
      navHeight: app.globalData.navHeight,
      id: unescape(options.id)
    })
    var param = {
      id: options.id,
      magType: 'SW2702'
    }
    // 通知
    http('/message/getMessageById', param, '', 'post').then(res => {
      if (res.success) {
        that.setData({
          notice: res.data.message
        })
        WxParse.wxParse('article', 'html', res.data.message.content, that, 5);
      } else {
        dialog.dialog('错误', '获取通知失败，请联系管理员!', false, '确定');
      }
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
  
  }
})