var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');

Page({
  data: {
    orderId: 0,
    expName: '',
    expNo: '',
    deliveryStatusText: '',
    message: '',
    traces: []
  },
  onLoad: function(options) {
    this.setData({
      orderId: options.orderId
    });
    this.getExpress();
  },
  onPullDownRefresh: function() {
    this.getExpress();
  },
  getExpress: function() {
    let that = this;
    util.request(api.OrderExpress, {
      orderId: that.data.orderId
    }).then(function(res) {
      wx.stopPullDownRefresh();
      if (res.errno === 0) {
        var data = res.data || {};
        that.setData({
          expName: data.expName || '',
          expNo: data.expNo || '',
          deliveryStatusText: data.deliveryStatusText || '',
          message: data.message || '',
          traces: data.traces || []
        });
      } else {
        that.setData({
          expName: '',
          expNo: '',
          deliveryStatusText: '',
          message: res.errmsg || '暂时无法查询物流，请稍后再试',
          traces: []
        });
      }
    }).catch(function() {
      wx.stopPullDownRefresh();
      that.setData({
        message: '暂时无法查询物流，请稍后再试',
        traces: []
      });
    });
  }
});
