const http = require('../../../utils/http.js')  // 引入
const dialog = require('../../../utils/dialog.js')  // 引入
var app = getApp()
Page({
  data: {
    orderDetail: {
    },
    orderAftersale: {
    },
    current : 0
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
    this.getOrderAfterDetail(param.id)
  },

  onShow: function () {
  },

  getOrderAfterDetail: function(id) {
    var that = this
    http('/orderAftersale/getDetail/' + id, '', '', 'get').then(res => {
      if (res.success) {
        that.setData({
          orderAftersale: res.data
        })
        let status = that.data.orderAftersale.aftersaleStatus
        let deliveryTime = that.data.orderAftersale.deliveryTime
        if (status === 'SW0802') {
          that.setData({
            current: 0
          })
        } else if (status === 'SW0804' && deliveryTime === '') {
            that.setData({
              current: 1
            })
        } else if (status === 'SW0804' && deliveryTime !== '') {
          that.setData({
            current: 2
          })
        } else if (status === 'SW0806') {
          that.setData({
            current: 3
          })
        } 
        console.log(that.data.orderAftersale)
      }
    })
  },

  deliverOrder: function (e) {
    var query = {
      id: e.currentTarget.dataset.id,
      aftersaleNo: e.currentTarget.dataset.no,
      applyTime: e.currentTarget.dataset.time,
      attributes: e.currentTarget.dataset.attr,
      goodsName: e.currentTarget.dataset.name,
      applyNum: e.currentTarget.dataset.num,
      pic: e.currentTarget.dataset.pic 
    }
    wx.navigateTo({
      url: '/pages/my/order-refund-delivery/orderRefundDelivery?param=' + JSON.stringify(query)
    })
  },

  cancelApply: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    var orderId = e.currentTarget.dataset.orderid;
    var orderDetailId = e.currentTarget.dataset.orderdetailid;
    wx.showModal({
      title: '确定要取消该申请单吗？',
      content: '',
      success: function (res) {
        if (res.confirm) {
          wx.showLoading({
            mask: true
          });
          var param = {
            id: id,
            orderId: orderId,
            orderDetailId: orderDetailId
          }
          http('/orderAftersale/cancelOrderAftersale', param, '', 'post').then(res => {
            wx.hideLoading();
            if(res.success){
              wx.navigateBack({})
            }else{
              dialog.dialog('错误', '取消申请单异常，请联系管理员!', false, '确定');
            }
          })
        }
      }
    })
  }

})