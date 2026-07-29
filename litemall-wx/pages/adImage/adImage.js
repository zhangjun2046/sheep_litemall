// adImage.js
Page({
  data: {
    imageUrl: '',
    loading: true
  },

  onLoad: function (options) {
    // url 已经在首页请求（util.request -> upgradeHttpInData）时统一处理过 http/https，此处直接使用
    var url = options.url ? decodeURIComponent(options.url) : '';
    this.setData({
      imageUrl: url
    });
  },

  onImageLoad: function (e) {
    this.setData({
      loading: false
    });
  },

  onImageError: function (e) {
    var src = (e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.src) || '';
    console.error('poster load failed:', src, e.detail);
    this.setData({
      loading: false
    });
    wx.showModal({
      title: '图片加载失败',
      content: '请检查网络后重试。失败地址：' + src,
      showCancel: false
    });
  }
})
