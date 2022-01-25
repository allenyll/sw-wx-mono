const http = require('../../../utils/http.js')  // 引入
const dialog = require('../../../utils/dialog.js')  // 引入
var app = getApp();

Page({
  data: {
    array: ['请选择反馈类型', '商品相关', '物流状况', '客户服务', '优惠活动', '功能异常', '产品建议', '其他'],
    type: '',
    index: 0,
    inputTxt: '',
    content: '',
    contentLen: 0
  },
  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value,
      type: this.data.array[e.detail.value]
    })
  },
  setMobileNumber: function(e) {
    this.setData({
      //更新页面input框显示
      inputTxt: e.detail.value
    })
  },
  clearMobileNumber: function(){
    this.setData({
      //更新页面input框显示
      inputTxt: ''
    })
  },
  /*动态计算能够输入的字数*/
  checkLength: function(e) {
    var that = this
    var maxChars = 500
    if (e.detail.value.length > maxChars) {
      e.detail.value = e.detail.value.substring(0, maxChars)
    }
    that.setData({
      content: e.detail.value,
      contentLen: e.detail.value.length
    })
  },
  submitFeed: function() {
    var that = this
    if(!that.data.type) {
      dialog.dialog('提示', '请选择反馈类型!', false, '确定')
      return
    }
    if (that.data.contentLen === 0) {
      dialog.dialog('提示', '请输入反馈内容!', false, '确定')
      return
    }
    if(!that.data.inputTxt) {
      dialog.dialog('提示', '请填写联系方式，方便我们与您联系!', false, '确定')
      return
    }
    let param = {
      type: that.data.type,
      content: that.data.content,
      phone: that.data.inputTxt
    }
    http('/feedback/saveFeedback', param, '', 'post').then(res => {
      if (res.success) {
        dialog.showToast('提交成功', 'success', '', 2000)
        wx.navigateBack({})
      } else {
        dialog.dialog('错误', '提交出现错误，请稍后再试，抱歉!', false, '确定')
        return
      }
    })
  },
  onLoad: function (options) {
    this.setData({ 
      navHeight: app.globalData.navHeight
    })
  },
  onReady: function () {

  },
  onShow: function () {

  },
  onHide: function () {
    // 页面隐藏

  },
  onUnload: function () {
    // 页面关闭
  }
})