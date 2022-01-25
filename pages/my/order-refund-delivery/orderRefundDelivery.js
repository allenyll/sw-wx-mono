const http = require('../../../utils/http.js')  // 引入
const dialog = require('../../../utils/dialog.js')  // 引入
var app = getApp()
Page({
  data: {
    deliveryCom: ['请选择快递公司', '顺丰快递', '中通快递', '申通快递', '圆通快递', '韵达快递', '邮政快递', '京东快递', '天天快递', '百世快递', 'EMS'],
    deliveryCompany: '',
    deliveryNo: '',
    index: 0,
    orderDetail: {
    }
  },

  bindPickerChange: function (e) {
    this.setData({
      index: e.detail.value,
      deliveryCompany: this.data.deliveryCom[e.detail.value]
    })
  },

  setDeliveryNo: function(e) {
    this.setData({
      deliveryNo: e.detail.value
    })
  },

  saveDeliveryInfo: function() {
    var that = this
    if(!that.data.deliveryCompany) {
      dialog.dialog('提示', '请选择快递公司!', false, '确定')
      return
    }
    if (!that.data.deliveryNo) {
      dialog.dialog('提示', '请输入快递单号!', false, '确定')
      return
    }
    let param = {
      id: that.data.orderDetail.id,
      deliveryCompany: that.data.deliveryCompany,
      deliveryNo: that.data.deliveryNo
    }
    http('/orderAftersale/saveDeliveryInfo', param, '', 'post').then(res => {
      if (res.success) {
        dialog.showToast('保存成功', 'success', '', 2000)
        wx.navigateBack({})
      } else {
        dialog.dialog('错误', '提交出现错误，请稍后再试，抱歉!', false, '确定')
        return
      }
    })
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
  },

  onShow: function () {
  }
})