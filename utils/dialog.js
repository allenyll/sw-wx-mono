var dialog = function(title, content, showCancel, confirmText){
  wx.showModal({
    title: title,
    content: content,
    showCancel: showCancel,
    confirmText: confirmText,
    success: function (res) {
      if (res.confirm) {
        //console.log('用户点击了“返回授权”')
      }
    }
  })
},

showToast = function(title, icon, image, time){
    wx.showToast({
    title: title,
    icon: icon,
    image: image,
    duration: time
  })
 }

module.exports = {
  dialog: dialog,
  showToast: showToast
}