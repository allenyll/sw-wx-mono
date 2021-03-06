const http = require('../../../utils/http.js')  // 引入
const dialog = require('../../../utils/dialog.js')  // 引入
var app = getApp()

Page({
  data: {
    id: '', // 用户ID
    integralPage: 0, // 控制是否展开 0:显示主页 1:显示积分规则页
    canUseIntegral: 0, // 现有积分
    totalIntegral: 0, // 总积分
    currentMessageType: 'income', // income:收入 / outcome:支出
    // navStyle: '',
    navFixed: false, // 固定导航条
    // 积分规则
    integralRule: {
      convertNum: 100, // xx积分对应1元
      consumeNum: 0, // 消费xx元积累1积分
      loginNum: 0, // 每天登录送xx积分
      postCommentNum: 0, // 商品评论送xx积分
      shareNum: 0, // 推荐好友送xx积分
    },
    /*
      xxxBranch 对象
      data: 对应分支的数据
      isMore: 是否拥有更多的新的数据
      currentPage: 当前已经加载到页数
      onload: 是否处在数据加载中， true加载中，false加载完毕
    */
    incomeBranch: {
      data: [
      ],
      isMore: 0,
      currentPage: 1,
      onload: false
    },
    outcomeBranch: {
      data: [],
      isMore: 0,
      currentPage: 1,
      onload: false
    },
  },
  onLoad: function (options) {
    console.log(unescape(options.id))
    this.setData({
      navHeight: app.globalData.navHeight,
      id: unescape(options.id)
    })
    this.getPoint();
    //this.getIntegralRuleData();
    this.getPointDetail('income');
    this.getPointDetail('outcome');
  },

  // 获得积分详情数据
  getPoint: function () {
    let that = this;
    var param = {
      customerId: app.globalData.userInfo.id
    }
    http('/customerPoint/getPoint', param, '', 'POST').then(res => {
      that.setData({
        'canUseIntegral': Number(res.data.customerPoint.point) - Number(res.data.customerPoint.used),
        'totalIntegral': res.data.customerPoint.point
      });
    })
  },
  // 获得积分规则数据
  getIntegralRuleData: function () {
    let that = this;
    app.sendRequest({
      url: '/index.php?r=AppShop/IntegralRule',
      success: function (res) {
        that.setData({
          'integralRule.convertNum': res.data.convert_num,
          'integralRule.consumeNum': res.data.consume_num,
          'integralRule.loginNum': res.data.login_num,
          'integralRule.postCommentNum': res.data.post_comment_num,
          'integralRule.shareNum': res.data.share_num
        });
      }
    });
  },
  // 获取对应消息数据
  getPointDetail: function (type, page) {
    let that = this;
    let action = '';
    if (type == 'income') {
      action = 'SW0501';
    } else if (type = 'outcome') {
      action = 'SW0502';
    }
    var param = {
      'customerId': app.globalData.userInfo.id,
      'action': action,
      'page': page || 1
    }
    http('/customerPoint/getPointDetail', param, '', 'post').then(res => {
      switch(type){
        // 收入消息
        case 'income':
          that.setData({
            'incomeBranch.data': that.data.incomeBranch.data ? that.data.incomeBranch.data.concat(that.parseMessageData(res.data.list, type)) : that.parseMessageData(res.data.list, type),
            'incomeBranch.isMore': res.data.is_more,
            'incomeBranch.currentPage': res.data.current_page,
            'incomeBranch.onload': false,
          });
          break;
        // 支出消息
        case 'outcome':
          that.setData({
            'outcomeBranch.data': that.data.outcomeBranch.data ? that.data.outcomeBranch.data.concat(that.parseMessageData(res.data.list, type)) : that.parseMessageData(res.data.list, type),
            'outcomeBranch.isMore': res.data.is_more,
            'outcomeBranch.currentPage': res.data.current_page,
            'outcomeBranch.onload': false,
          })
          break;
      }
    })
  },
  // 解析对应消息数据
  parseMessageData: function (data, type) {
    var that = this;
    let array = [];
    let item = {};
    data = data.records;
    for (var i = 0; i < data.length; i++) {
      item = {
        content: data[i].remark,
        num: data[i].point
      }
      if('income' == type){
        item.time = data[i].expiredTime
      }else if(type == 'outcome'){
        item.time = data[i].getTime
      }
      array.push(item);
    }
    return array;
  },
  // 底部触发是否获取数据
  checkMoreMessageData: function () {
    let that = this;
    switch (that.data.currentMessageType) {
      case 'income':
        // 有更多数据 并且 不在加载中时 执行
        if ((that.data.incomeBranch.isMore != 0) && (!that.data.incomeBranch.onload)) {
          that.getPointDetail('income', (that.data.incomeBranch.currentPage + 1));
          that.setData({
            'incomeBranch.onload': true
          });
        }
        break;
      case 'outcome':
        // 有更多数据 并且 不在加载中时 执行
        if ((that.data.outcomeBranch.isMore != 0) && (!that.data.outcomeBranch.onload)) {
          that.getPointDetail('outcome', (that.data.outcomeBranch.currentPage + 1));
          that.setData({
            'outcomeBranch.onload': true
          });
        }
        break;
    }
  },
  // 固定消息导航条
  fixedMessageNav: function (event) {
    var that = this;
    if (event.detail.scrollTop <= 135) {
      that.setData({
        // navStyle: ''
        navFixed: false
      });
    } else {
      that.setData({
        // navStyle: 'position: fixed; top: 0; left: 0;'
        navFixed: true
      });
    }
  },
  // 切换显示的消息类型
  setCurrentMessageType: function (event) {
    this.setData({
      'currentMessageType': event.target.dataset.type
    });
  },
  // 积分规则：打开积分详情
  showIntegralRule: function () {
    // 设置页面标题
    app.setPageTitle('积分规则');
    // 请求数据
    this.setData({
      'integralPage': 1
    });
  },
  // 积分规则：关闭积分详情(返回:个人积分主页)
  hideIntegralRule: function () {
    // 设置页面标题
    app.setPageTitle('个人积分');
    // 回到系统通知页面,清空表单数据
    this.setData({
      'integralPage': 0
    });
  }
})
