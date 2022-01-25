const http = require('../../../utils/http.js')  // 引入
const dialog = require('../../../utils/dialog.js')  // 引入
var app = getApp()
Page({
  data: {
    orderDetail: {
    },
    pageType: '',
    tempFilePaths: [],
    fileId: '',
    refundPoint: 0,
    applyNum: 1,
    usePointAmount: 0,
    getPointAmount: 0,
    refundAmount: 0,
    refundAmountStr: '￥' + 0,
    order: {},
    orderDetailItem: {},
    isEnabled: false,
    remark: '',
    contentLen: 0,
    uploadFlag: false,
    reason: '请选择',
    reasonShow: false,
    reasonList: [
      {
        id: 0,
        reason: '我不想要了'
      },
      {
        id: 1,
        reason: '发错货'
      },
      {
        id: 2,
        reason: '商品与页面描述不符'
      },
      {
        id: 3,
        reason: '价格变化'
      },
      {
        id: 4,
        reason: '商品瑕疵'
      },
      {
        id: 5,
        reason: '质量问题'
      },
      {
        id: 6,
        reason: '其他'
      },
    ],
    refundType: '原路返回',
    refundTypeDic: 'SW3001',
    refundTypeShow: false,
    refundTypeList: [
      {
        id: 'SW3001',
        reason: '原路返回'
      }
      // ,
      // {
      //   id: 'SW3002',
      //   reason: '退还至余额'
      // },
      // {
      //   id: 'SW3003',
      //   reason: '手动处理'
      // }
    ],
    backType: '请选择',
    backTypeDic: '',
    backTypeShow: false,
    backTypeList: [
      // {
      //   id: 'SW3101',
      //   reason: '上门取件'
      // },
      {
        id: 'SW3102',
        reason: '送至门店'
      },
      {
        id: 'SW3103',
        reason: '快递'
      }
    ],
    pageName: '退款'
  },

  onLoad: function (options) {
    console.log('测试')
    var that = this
    that.setData({ 
      navHeight: app.globalData.navHeight
    })
    var type = options.type
    if ("SW2901" === type) {
      that.setData({ 
        pageName: '退款' 
      })
    } else if ("SW2902" === type) {
      that.setData({ 
        pageName: '换货' 
      })
    } else if ("SW2903" === type) {
      that.setData({ 
        pageName: '退款退货' 
      })
    }
    let param = JSON.parse(options.param)
    that.setData({
      orderDetail: param,
      pageType: type
    })
  },

  onShow: function () {
    console.log(this.data.uploadFlag)
    if (!this.data.uploadFlag) {
      this.getOrderInfo()
    }
  },

  getOrderInfo: function() {
    http('/order/getOrderInfo', this.data.orderDetail, '', 'post').then(res => {
      let goodsPrice = res.data.orderDetail.goodsPrice
      let orderAmount = res.data.order.orderAmount
      let couponAmount = res.data.order.couponAmount
      let refundAmount = goodsPrice - couponAmount * (goodsPrice/orderAmount) * this.data.applyNum
      this.setData({
        order: res.data.order,
        orderDetailItem: res.data.orderDetail,
        refundAmount: refundAmount,
        refundAmountStr: '￥' + refundAmount
      })
    })
  },

  /*动态计算能够输入的字数*/
  checkLength: function(e) {
    var that = this
    var maxChars = 500
    if (e.detail.value.length > maxChars) {
      dialog.showToast('最大只能输500个字', null, '', 2000)
      e.detail.value = e.detail.value.substring(0, maxChars)
    }
    that.setData({
      remark: e.detail.value,
      contentLen: e.detail.value.length
    })
  },

  // 添加图片
  addImage() {
    let that = this
    that.setData({
      uploadFlag: true
    })
    let paths = this.data.tempFilePaths
    let fileId = this.data.fileId
    if (paths.length == 3) {
      dialog.showToast('最多只能上传3张图片', null, '', 2000)
      return
    }
    wx.chooseImage({
      count: 4, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: res => {
        let path = res.tempFilePaths
        console.log(path)
        wx.showToast({
          title: '正在上传...',
          icon: 'loading',
          mask: true,
          duration: 10000
        })
        for (var i = 0; i < path.length; i++) {
          wx.uploadFile({
            url: app.globalData.baseHttpUrl + '/file/upload',
            filePath: path[i],
            name: 'file',
            formData: {
              customerId: app.globalData.userInfo.id,
              type: 'SW1804',
              id: ''
            },
            header: {
              "Content-Type": "multipart/form-data",
              'Authorization': wx.getStorageSync('token'),
              'login-type': 'wx'
            },
            success: function(_res) {
              var data  = JSON.parse(_res.data)
              if (data.code === '100000') {
                paths.push(data.data.url)
                if (fileId === '') {
                  fileId = data.data.fileId
                } else {
                  fileId += ',' + data.data.fileId
                }
                that.setData({
                  tempFilePaths: paths,
                  fileId: fileId
                })
                wx.hideToast()
              } else {
                wx.hideToast()
                dialog.showToast('上传文件失败...', 'error', '', 2000)
              }
            },
            fail: function(err) {
              wx.hideToast()
            }
          })
        }
      }
    })
  },
  // 图片预览
  previewImage(e) {
    let id = app.utils.getDataSet(e, 'id')
    let that = this
    wx.previewImage({
      current: that.data.tempFilePaths[id],
      urls: that.data.tempFilePaths,
    })
  },
  // 删除预览图片
  deleltImage(e) {
    let id = app.utils.getDataSet(e, 'id')
    console.log(id)
    let arr = this.data.tempFilePaths
    arr.splice(id, 1);
    this.setData({
      tempFilePaths: arr
    }, () => {
      console.log(this.data.tempFilePaths)
    })
  },

  /**
   * 选择申请原因
   */
  selectReason: function() {
    this.setData({ reasonShow: true });
  },
  
  /**
   * 关闭申请原因弹窗
   */
  onCloseReason() {
    this.setData({ reasonShow: false });
  },

  /**
   * 申请原因选择
   * @param {*} event 
   */
  onClickReason(event) {
    const { name } = event.currentTarget.dataset;
    console.log(name)
    this.setData({
      reason: name,
    });
    this.onCloseReason()
  },

  /**
   * 选择退款方式
   */
  selectRefundType: function() {
    this.setData({ refundTypeShow: true });
  },
  
  /**
   * 关闭退款方式弹窗
   */
  onCloseRefundType() {
    this.setData({ refundTypeShow: false });
  },

  /**
   * 退款方式选择
   * @param {*} event 
   */
  onClickRefundType(event) {
    console.log(event)
    const name = event.currentTarget.dataset.name;
    const id = event.currentTarget.dataset.id;
    console.log(name + id)
    this.setData({
      refundType: name,
      refundTypeDic: id 
    });
    this.onCloseRefundType()
  },

   /**
   * 选择返还方式
   */
  selectBackType: function() {
    this.setData({ backTypeShow: true });
  },
  
  /**
   * 关闭返还方式弹窗
   */
  onCloseBackType() {
    this.setData({ backTypeShow: false });
  },

  /**
   * 返还方式选择
   * @param {*} event 
   */
  onClickBackType(event) {
    const name = event.currentTarget.dataset.name;
    const id = event.currentTarget.dataset.id;
    console.log(name + id)
    this.setData({
      backType: name,
      backTypeDic: id 
    });
    this.onCloseBackType()
  },

  /**
   * 修改申请数量
   * @param event 
   */
  onChangeApplyNum(event) {
    let applyNumOld = this.data.applyNum
    let _refundAmount = this.data.refundAmount / applyNumOld * event.detail
    this.setData({
      applyNum: event.detail,
      refundAmount: _refundAmount,
      refundAmountStr: '￥' + _refundAmount
    });
    console.log(this.data.refundAmount)
  },

  onClick(event) {
    const { name } = event.currentTarget.dataset;
    this.setData({
      radio: name,
    });
  },

  refundSubmit: function() {
    var that = this
    if(that.data.reason === '请选择') {
      dialog.dialog('提示', '请选择申请原因!', false, '确定')
      return
    }
    if (that.data.refundType === '请选择') {
      dialog.dialog('提示', '请选择退款方式!', false, '确定')
      return
    }
    if (that.data.contentLen === 0) {
      dialog.dialog('提示', '请输入具体的申请内容，方便我们为您服务!', false, '确定')
      return
    }
    let param = {
      customerId: app.globalData.userInfo.id,
      orderId: that.data.order.id,
      orderDetailId: that.data.orderDetailItem.id,
      goodsId: that.data.orderDetailItem.goodsId,
      aftersaleType: that.data.pageType, 
      aftersaleStatus: 'SW0802',
      aftersaleReason: that.data.reason,
      applyFile: that.data.fileId,
      refundPoint: that.data.refundPoint,
      usePointAmount: that.data.usePointAmount,
      getPointAmount: that.data.getPointAmount,
      refundAmount: that.data.refundAmount,
      refundType: that.data.refundTypeDic,
      refundQuality: that.data.applyNum,
      refundRemark: that.data.remark,
      returnType: that.data.backType == '请选择' ? '' : that.data.backTypeDic
    }
    console.log(param)
    http('/orderAftersale/submitOrderAftersale', param, '', 'post').then(res => {
      if (res.success) {
        dialog.showToast('提交成功', 'success', '', 2000)
        // 返回申请列表
        wx.redirectTo({
          url: '/pages/my/order-refund/orderRefund?id=' + escape(app.globalData.userInfo.id) + '&type=SW0801'
        })
      } else {
        dialog.dialog('错误', '提交出现错误，请稍后再试，抱歉!', false, '确定')
        return
      }
    })
  }
})