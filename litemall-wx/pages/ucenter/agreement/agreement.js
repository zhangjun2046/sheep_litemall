var texts = require('../../../utils/agreement.js');

Page({
  data: {
    activeTab: 'user',
    scrollTop: 0,
    updated: '更新日期：2026年10月12日 · 生效日期：2026年10月12日',
    bodyText: ''
  },
  onLoad: function(options) {
    var tab = options.tab === 'privacy' ? 'privacy' : 'user';
    this.setTab(tab, true);
  },
  setTab: function(tab, firstLoad) {
    var nextTop = this.data.scrollTop === 0 ? 0.01 : 0;
    this.setData({
      activeTab: tab,
      bodyText: tab === 'privacy' ? texts.PRIVACY_BODY : texts.AGREEMENT_BODY,
      scrollTop: firstLoad ? 0 : nextTop
    });
  },
  switchTab: function(e) {
    var tab = e.currentTarget.dataset.tab;
    if (tab === this.data.activeTab) {
      return;
    }
    this.setTab(tab, false);
  }
});
