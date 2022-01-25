const http = require('/http.js')  // 引入
const dialog = require('/dialog.js')  // 引入

function wxpay(app, money, orderId, redirectUrl, type) {
  let remark = "在线充值";
  let nextAction = {};
  let transactionId = '';
  if (orderId != 0) {
    remark = "支付订单 ：" + orderId;
    console.log(orderId)
  }
  wx.request({
    url: app.globalData.baseUrl + '/pay/createOrder',
    method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    // 当method 为POST 时 设置以下 的header 
    header: { 
      'Authorization': wx.getStorageSync('token'),
      'content-type': 'application/x-www-form-urlencoded',
      'login-type': 'wx' 
      },
    data: {
      token: wx.getStorageSync('token'),
      amount: money,
      remark: remark,
      payName: "在线支付",
      nextAction: nextAction,
      openid: wx.getStorageSync('openid'),
      customerId: app.globalData.userInfo.id,
      orderId: orderId,
      mode: 'sweb_wx'
    },
    //method:'POST',
    success: function (res) {
      if (res.data.success) {
        transactionId = res.data.data.transactionId
        if (res.data.data.paySign) {
          // 发起支付
          wx.requestPayment({
            timeStamp: res.data.data.timeStamp,
            nonceStr: res.data.data.nonceStr,
            package: res.data.data.packageValue,
            signType: res.data.data.signType,
            paySign: res.data.data.paySign,
            fail: function (res) {
              if ('order' == type) {
                // 支付取消或者失败 将订单放入消息队列，定时取消未支付订单
                const _param = {
                  orderId: orderId
                }
                http('/order/sendMessage', _param, '', 'post').then(_res => {
                  if (_res.success) {
                    wx.redirectTo({
                      url: '/pages/payResult/payResult?status=false',
                    })
                  }
                })
              }
              if (res.errMsg == 'requestPayment:fail cancel') {
                dialog.dialog('提示', '您取消了支付', false, '确定');
              } else {
                dialog.dialog('提示', res.errMsg, false, '确定');
              }
            },
            success: function () {
              wx.showToast({ title: '支付成功' })
              // 保存金额到用户账户中
              if('charge' == type) {
                const param = {
                  openid: wx.getStorageSync('openid'),
                  amount: money,
                  customerId: app.globalData.userInfo.id,
                  remark: remark
                }
                http('/customerBalance/updateBalance', param, '', 'post').then(res => {       
                  // 更新支付记录状态为成功
                  if(res.success){
                    wx.redirectTo({
                      url: redirectUrl
                    });
                  }
                })
              } else {
                wx.redirectTo({
                  url: '/pages/payResult/payResult?status=true&orderId='+orderId+'&transactionId='+transactionId+'&money='+money,
                })
              }
            }
          })
        } else {
          wx.redirectTo({
            url: '/pages/payResult/payResult?status=false',
          })
          // dialog.dialog('提示', res.message, false, '确定');
        }
        
      } else {
        wx.redirectTo({
          url: '/pages/payResult/payResult?status=false',
        })
        // dialog.dialog('提示', res.message, false, '确定');
      }
    }
  })
}

module.exports = {
  wxpay: wxpay
}
