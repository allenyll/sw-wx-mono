//index.js
const http = require('../../utils/http.js')  // 引入
const dialog = require('../../utils/dialog.js')  // 引入
//获取应用实例
var app = getApp()
Page({
  data: {
    addressList:[]
  },

  selectTap: function (e) {
    var id = e.currentTarget.dataset.id;
    http('/customerAddress/updateAddress/'+id, null, null, 'post').then(res => {
      if(res.success){
        wx.navigateBack({
          type: 'select'
        })
      } else {
        dialog.dialog('错误', '更新选中地址失败', false, '确定');
      }
    })
  },

  addAddess : function () {
    wx.navigateTo({
      url:"/pages/add-address/addAddress"
    })
  },
  
  editAddess: function (e) {
    wx.navigateTo({
      url: "/pages/add-address/addAddress?id=" + e.currentTarget.dataset.id
    })
  },
  
  onLoad: function (options) {
    this.setData({ 
      navHeight: app.globalData.navHeight,
      page: options.page
    })
  },
  onShow : function () {
    let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
    let prevPage = pages[pages.length - 2];//prevPage 是获取上一个页面的js里面的pages的所有信息。 -2 是上一个页面，-3是上上个页面以此类推。
    prevPage.setData({  // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。
      pageType: 'back'
    })
    this.initAddress();
  },
  initAddress: function () {
    var that = this;
    var param = {
      customerId: app.globalData.userInfo.id
    }
    http('/customerAddress/getAddressList', param, null, 'post').then(res => {
      if (res.success) {
        if (res.data.length > 0) {
          that.setData({
            addressList: res.data
          });
        } else {
          that.setData({
            addressList: null
          })
        }
      } else {
        dialog.dialog('错误', '获取收货地址失败，请联系管理员!', false, '确定');
      }
    });
  }

})
