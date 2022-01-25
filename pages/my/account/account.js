// pages/my/account/account.js
const http = require('../../../utils/http.js')  // 引入
const dialog = require('../../../utils/dialog.js')  // 引入
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    showPhone: false,
    customerAccount:'',
    sex: ['女', '男', '请选择'],
    sexArray: [
      {
        id: 0,
        name: '女'
      },
      {
        id: 1,
        name: '男'
      },
      {
        id: 2,
        name: '请选择'
      }
      
    ],
    index: 0,
    email: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    that.setData({ 
      navHeight: app.globalData.navHeight
    })
    if (app.globalData.userInfo != null) {
      console.log(app.globalData.userInfo.gender)
      let gender = app.globalData.userInfo.gender
      if (gender === 'SW0201') {
        gender = 1
      } else if (gender === 'SW0202') {
        gender = 0
      } else {
        gender = 3
      }
      let sex = Number(gender);
      if(0 != sex && 1 != sex){
        this.setData({
          index: 2
        })
      }else{
        this.setData({
          index: sex
        })
      }
      that.setData({
        userInfo: app.globalData.userInfo
      })
    }
  },

  bindAccountInput: function(e) {
    this.setData({
      customerAccount: e.detail.value
    })
  },

  bindPickerChange: function (e) {
    console.log("picker"+e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },

  bindEmailInput: function(e) {
    this.setData({
      email: e.detail.value
    })
  },

  saveAccount: function () {
    var that = this
    var reg = new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$"); //正则表达式
    var param = {
      openid: wx.getStorageSync('openid')
    }
    if (that.data.email != '') {
      if (!reg.test(that.data.email)) {
        dialog.dialog('警告', '请输入正确的邮箱', false, '确定')
        return
      }
      param.email = that.data.email
    }
    if(that.data.customerAccount != ''){
      param.customerAccount = that.data.customerAccount
    }
    console.log(that.data.index)
    if (that.data.index != 2) {
      param.sex = that.data.index
    }
    http('/customer/updateCustomerAccount', param , '', 'post').then(res => {
      dialog.showToast('保存成功', 'success', '', 2000)
    })
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