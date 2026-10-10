var util = require('../../utils/util.js');
var api = require('../../config/api.js');

var app = getApp();
Page({
  data: {
    status: false,
    orderId: 0
  },
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({
      orderId: options.orderId,
      status: options.status === '1' ? true : false
    })
  },
  onReady: function() {

  },
  onShow: function() {
    // 页面显示

  },
  onHide: function() {
    // 页面隐藏

  },
  onUnload: function() {
    // 页面关闭

  },
  payOrder() {
    let that = this;
    util.request(api.OrderPrepay, {
      orderId: that.data.orderId
    }, 'POST').then(function(res) {
      util.logWxPay('prepay 返回', {
        errno: res.errno,
        errmsg: res.errmsg,
        orderId: that.data.orderId,
        orderSn: res.data && res.data.orderSn,
        outTradeNo: res.data && res.data.outTradeNo,
        packageValue: res.data && res.data.packageValue,
        signType: res.data && res.data.signType,
        timeStamp: res.data && res.data.timeStamp
      });
      if (res.errno === 0) {
        const payParam = res.data;
        const payOrderSn = payParam.orderSn;
        util.logWxPay('支付过程开始', { orderId: that.data.orderId, orderSn: payOrderSn });
        wx.requestPayment({
          'timeStamp': payParam.timeStamp,
          'nonceStr': payParam.nonceStr,
          'package': payParam.packageValue,
          'signType': payParam.signType,
          'paySign': payParam.paySign,
          'success': function(res) {
            util.logWxPay('支付过程成功', res);
            that.setData({
              status: true
            });
          },
          'fail': function(res) {
            util.showPayFail(res, null, { orderSn: payOrderSn });
          },
          'complete': function(res) {
            util.logWxPay('支付过程结束', res);
          }
        });
      } else {
        util.logWxPay('prepay 失败，跳过 requestPayment', res);
        util.showErrorToast(res.errmsg || '支付失败');
      }
    });
  }
})