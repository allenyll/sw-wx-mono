const app = getApp()
const http = require('../../utils/http.js')  // 引入
const dialog = require('../../utils/dialog.js')  // 引入
const user = require('../../utils/user.js')  // 引入
Page({
  data: {
    canIUseGetUserProfile:false,
    url: '',
    param: {}
  },
  onLoad: function(options) {
    var that = this;
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
    that.setData({
      navHeight: app.globalData.navHeight
    })
    // let param = JSON.parse(options.param)
    // that.setData({
    //   param: param
    // })
  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
    // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        user.checkLogin().catch(() => {
          user.loginByWeixin(app.globalData.baseUrl, res.userInfo).then(res => {
            app.globalData.hasLogin = true;
            app.globalData.userInfo = res.data.data.customer;
            wx.navigateBack({
              delta: 1
            });
          }).catch((err) => {
            app.globalData.hasLogin = false;
            dialog.dialog('警告', '微信登录失败', false, '确定')
          });
        });
      },
      fail: (res) => {
        app.globalData.hasLogin = false;
        dialog.dialog('警告', '微信登录失败', false, '确定')
      }
    })
  },
  getUserInfo: function (e) {
    if (e.detail.userInfo) {
      e.detail.userInfo.openid = wx.getStorageSync('openid')
      //用户按了允许授权按钮
      var that = this;
      //插入登录的用户的相关信息到数据库
      http('/customer/updateCustomer', e.detail.userInfo, '', 'post').then(res => {
        if (res.success) {
          //从数据库获取用户信息
          that.queryUserInfo();
        } else {
          dialog.dialog('警告', res.message, false, '确定')
        }
      })
      //授权成功后，跳转进入小程序首页
      // wx.switchTab({
      //     url: '/pages/my/my'  
      // })
    } else {
      //用户按了拒绝按钮
      dialog.dialog('警告', '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!', false, '返回授权')
    }
  },

  queryUserInfo: function () {
    var that = this;
    http('/customer/queryUserByOpenId?openid=' + wx.getStorageSync('openid'),'', '', 'post').then(res => {
      if (!res.success) {
        dialog.dialog('警告', '授权失败!!!', false, '返回授权')
        return
      }
      var user = res.data;
      if (undefined === user) {
        dialog.dialog('警告', '授权失败!!!', false, '返回授权')
        return
      }
      app.globalData.userInfo = user
      //授权成功后，跳转进入小程序首页
      var page = that.data.param.page
      var url = that.data.param.url
      if ('goods' !== page) {
        url += '?id=' + escape(app.globalData.userInfo.id)
      } else {
        url = url + '?id=' + that.data.param.type
        wx.navigateBack({
          delta: 1,
        })
      }
      if ('order' === page) {
        url = url + '&type=' + that.data.param.type
      }
      if ('orderPay' === page) {
        url = url + '?orderType=' + that.data.param.type 
      }
      if ('cart' === page) {
        wx.switchTab({
          url: url,
        })
      } else {
        wx.redirectTo({
          url: url
        })
      }
    })
  }

})