const http = require('../../utils/http.js')  // 引入
const dialog = require('../../utils/dialog.js')  // 引入
var wxpay = require('../../utils/pay.js')
var app = getApp();
Page({
  data: {
    orderId: 0,
    logisticsFee: "0.00",
    allGoodsPrice: "0.00",
    active: 0,
    time: 43874,
    statusSteps: [
      {
        current: false,
        done: false,
        text: '待支付',
        desc: ''
      },
      {
        done: false,
        current: false,
        text: '待发货',
        desc: ''
      },
      {
        done: false,
        current: false,
        text: '待收货',
        desc: ''
      },
      {
        done: false,
        current: false,
        text: '待评价',
        desc: ''
      },
      {
        done: false,
        current: false,
        text: '已完成',
        desc: ''
      }
    ],
  },
  onLoad: function (e) {
    var orderId = e.id;
    this.data.orderId = orderId;
    this.setData({
      navHeight: app.globalData.navHeight,
      orderId: orderId
    });
  },
  onShow: function () {
    var that = this;
    http('/orderDetail/getOrderDetail/'+that.data.orderId, '', '', 'post').then(res => {
      if(res.success){
        that.setData({
          orderDetail: res.data.order
        })
        that.updateStatusSteps(res.data.order)
        // var logisticsFee = parseFloat(res.order.logisticsFee);
        // var allprice = 0;
        // var goodsList = res.order.orderDetails;
        // for (var i = 0; i < goodsList.length; i++) {
        //   allprice += parseFloat(goodsList[0].goodsPrice) * goodsList[0].quantity;
        // }
        // this.setData({
        //   allGoodsPrice: allprice,
        //   logisticsFee: logisticsFee
        // });
      }else{
        dialog.dialog('错误', '获取订单明细异常', false, '确定');
      }
    });
  },
  receiveOrderTap(e) {
    var that = this;
    var orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认已收到货？',
      content: '',
      success: function (res) {
        if (res.confirm) {
          wx.showLoading();
          http('/order/receiveOrder/' + orderId, '', '', 'post').then(res => {
            wx.hideLoading();
            if (res.success) {
              that.onShow();
            } else {
              dialog.dialog('错误', '订单确认收货异常，请联系管理员!', false, '确定');
            }
          })
        }
      }
    })
  },
  wuliuDetailsTap: function (e) {
    var orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "/pages/wuliu/index?id=" + orderId
    })
  },
  cancelOrderTap: function (e) {
    var that = this;
    var orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确定要取消该订单吗？',
      content: '',
      success: function (res) {
        if (res.confirm) {
          wx.showLoading();
          var param = {
            note: '您取消了订单',
            orderId: orderId
          }
          http('/order/cancelMiniOrder', param, '', 'post').then(res => {
            wx.hideLoading();
            if (res.success) {
              that.onShow();
            } else {
              dialog.dialog('错误', '取消订单异常，请联系管理员!', false, '确定');
            }
          })
        }
      }
    })
  },
  deleteOrderTap(e) {
    var that = this;
    var orderId = e.currentTarget.dataset.id;
    console.log(orderId)
    wx.showModal({
      title: '确定要删除该订单吗？',
      content: '',
      success: function (res) {
        if (res.confirm) {
          wx.showLoading();
          http('/order/deleteOrder/' + orderId, '', '', 'post').then(res => {
            wx.hideLoading();
            if (res.success) {
              wx.redirectTo({
                url: '/pages/my/order-list/order?id=' + escape(app.globalData.userInfo.id),
              })
            } else {
              dialog.dialog('错误', '删除订单异常，请联系管理员!', false, '确定');
            }
          })
        }
      }
    })
  },
  toPayTap: function (e) {
    var that = this;
    debugger
    var orderId = e.currentTarget.dataset.id;
    var money = e.currentTarget.dataset.money;
    var integration = e.currentTarget.dataset.integration;
    wxpay.wxpay(app, money, orderId, '', "order");
  },
  submitReputation: function (e) {
    var that = this;
    var postJsonString = {};
    postJsonString.token = wx.getStorageSync('token');
    postJsonString.orderId = this.data.orderId;
    var reputations = [];
    var i = 0;
    while (e.detail.value["orderGoodsId" + i]) {
      var orderGoodsId = e.detail.value["orderGoodsId" + i];
      var goodReputation = e.detail.value["goodReputation" + i];
      var goodReputationRemark = e.detail.value["goodReputationRemark" + i];

      var reputations_json = {};
      reputations_json.id = orderGoodsId;
      reputations_json.reputation = goodReputation;
      reputations_json.remark = goodReputationRemark;

      reputations.push(reputations_json);
      i++;
    }
    postJsonString.reputations = reputations;
    wx.showLoading();
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/order/reputation',
      data: {
        postJsonString: postJsonString
      },
      success: (res) => {
        wx.hideLoading();
        if (res.data.code == 0) {
          that.onShow();
        }
      }
    })
  },
  updateStatusSteps: function (orderDetail) {
    var that = this
    if (orderDetail.orderStatus === 'SW0701') {
      that.setData({
        active: 0
      })
    } else if (orderDetail.orderStatus === 'SW0702') {
      that.setData({
        active: 1
      })
    } else if (orderDetail.orderStatus === 'SW0703') {
      that.setData({
        active: 2
      })
    } else if (orderDetail.orderStatus === 'SW0704') {
      that.setData({
        active: 3
      })
    } else if (orderDetail.orderStatus === 'SW0706') {
      that.setData({
        active: 4
      })
    }
  }
})