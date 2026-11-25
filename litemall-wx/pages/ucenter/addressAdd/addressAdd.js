var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
var check = require('../../../utils/check.js');
var area = require('../../../utils/area.js');

var app = getApp();

function emptySelectRegionList() {
  return [{
      id: 0,
      code: 0,
      name: '省份'
    },
    {
      id: 0,
      code: 0,
      name: '城市'
    },
    {
      id: 0,
      code: 0,
      name: '区县'
    }
  ];
}

function normalizeApiRegion(item) {
  return {
    id: item.id || 0,
    pid: item.pid,
    code: String(item.code),
    name: item.name,
    selected: false
  };
}

function fallbackList(level, code) {
  var type = 'province';
  var prefix;
  var codeStr = code == null ? '' : String(code);
  if (level === 2) {
    type = 'city';
    prefix = codeStr ? codeStr.slice(0, 2) : '';
  } else if (level === 3) {
    type = 'county';
    prefix = codeStr ? codeStr.slice(0, 4) : '';
  }
  return area.getList(type, prefix).map(function(item) {
    return {
      id: 0,
      code: String(item.code),
      name: item.name,
      selected: false
    };
  });
}

function markSelected(list, selectedCode) {
  var selected = selectedCode == null ? '' : String(selectedCode);
  return (list || []).map(function(item) {
    item.selected = selected !== '' && selected !== '0' && String(item.code) === selected;
    return item;
  });
}

Page({
  data: {
    address: {
      id: 0,
      areaCode: 0,
      address: '',
      name: '',
      tel: '',
      isDefault: 0,
      province: '',
      city: '',
      county: ''
    },
    addressId: 0,
    openSelectRegion: false,
    selectRegionList: emptySelectRegionList(),
    regionType: 1,
    regionList: [],
    selectRegionDone: false
  },
  bindinputMobile(event) {
    let address = this.data.address;
    address.tel = event.detail.value;
    this.setData({
      address: address
    });
  },
  bindinputName(event) {
    let address = this.data.address;
    address.name = event.detail.value;
    this.setData({
      address: address
    });
  },
  bindinputAddress(event) {
    let address = this.data.address;
    address.addressDetail = event.detail.value;
    this.setData({
      address: address
    });
  },
  bindIsDefault() {
    let address = this.data.address;
    address.isDefault = !address.isDefault;
    this.setData({
      address: address
    });
  },
  getAddressDetail() {
    let that = this;
    util.request(api.AddressDetail, {
      id: that.data.addressId
    }).then(function(res) {
      if (res.errno === 0) {
        if (res.data) {
          that.setData({
            address: res.data
          });
        }
      }
    });
  },
  setRegionDoneStatus() {
    let that = this;
    let doneStatus = that.data.selectRegionList.every(item => {
      return item.code != 0;
    });

    that.setData({
      selectRegionDone: doneStatus
    })

  },
  toastFallback() {
    util.showErrorToast('区域加载失败，已用本地数据');
  },
  loadRegions(level, pid, fallbackCode) {
    let that = this;
    // 兜底选出的项没有 id，不能用 pid=0 去拉市/区（会变成省级列表）
    if (level > 1 && !pid) {
      return Promise.resolve(fallbackList(level, fallbackCode));
    }
    let queryPid = pid;
    if (queryPid == null || queryPid === '') {
      queryPid = 0;
    }
    return util.request(api.RegionList, {
      pid: queryPid
    }).then(function(res) {
      if (res.errno === 0 && res.data && res.data.list) {
        return res.data.list.map(normalizeApiRegion);
      }
      that.toastFallback();
      return fallbackList(level, fallbackCode);
    }).catch(function() {
      that.toastFallback();
      return fallbackList(level, fallbackCode);
    });
  },
  loadChain(areaCode) {
    let that = this;
    return util.request(api.RegionChain, {
      code: areaCode
    }).then(function(res) {
      if (res.errno === 0 && res.data && res.data.province && res.data.city && res.data.county) {
        return res.data;
      }
      that.toastFallback();
      return null;
    }).catch(function() {
      that.toastFallback();
      return null;
    });
  },
  fillFromAreaCode(address) {
    let areaCode = String(address.areaCode);
    let selectRegionList = this.data.selectRegionList;
    selectRegionList[0] = {
      id: 0,
      code: areaCode.slice(0, 2) + '0000',
      name: address.province
    };
    selectRegionList[1] = {
      id: 0,
      code: areaCode.slice(0, 4) + '00',
      name: address.city
    };
    selectRegionList[2] = {
      id: 0,
      code: areaCode,
      name: address.county
    };
    this.setData({
      selectRegionList: selectRegionList,
      regionType: 3,
      regionList: markSelected(fallbackList(3, areaCode), areaCode)
    });
  },
  chooseRegion() {
    let that = this;
    this.setData({
      openSelectRegion: !this.data.openSelectRegion
    });

    if (!this.data.openSelectRegion) {
      return;
    }

    let address = this.data.address;
    if (address.areaCode && address.areaCode != 0) {
      that.loadChain(address.areaCode).then(function(chain) {
        if (!chain) {
          that.fillFromAreaCode(address);
          that.setRegionDoneStatus();
          return;
        }
        let selectRegionList = [
          normalizeApiRegion(chain.province),
          normalizeApiRegion(chain.city),
          normalizeApiRegion(chain.county)
        ];
        return that.loadRegions(3, chain.city.id, chain.county.code).then(function(regionList) {
          that.setData({
            selectRegionList: selectRegionList,
            regionType: 3,
            regionList: markSelected(regionList, chain.county.code)
          });
          that.setRegionDoneStatus();
        });
      });
    } else {
      let selectRegionList = emptySelectRegionList();
      that.loadRegions(1, 0).then(function(regionList) {
        that.setData({
          selectRegionList: selectRegionList,
          regionType: 1,
          regionList: regionList
        });
        that.setRegionDoneStatus();
      });
    }
  },
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
    console.log(options)
    if (options.id && options.id != 0) {
      this.setData({
        addressId: options.id
      });
      this.getAddressDetail();
    } else if (options.from === 'wechat') {
      let draft = {};
      try {
        draft = wx.getStorageSync('wxAddressDraft') || {};
        wx.removeStorageSync('wxAddressDraft');
      } catch (e) {}
      if (draft.notice) {
        wx.showToast({
          title: draft.notice,
          icon: 'none'
        });
      }
      this.setData({
        address: {
          id: 0,
          areaCode: 0,
          addressDetail: draft.addressDetail || '',
          name: draft.name || '',
          tel: draft.tel || '',
          isDefault: draft.isDefault ? 1 : 0,
          province: draft.province || '',
          city: draft.city || '',
          county: draft.county || ''
        }
      });
    }
  },
  onReady: function() {

  },
  selectRegionType(event) {
    let that = this;
    let regionTypeIndex = event.target.dataset.regionTypeIndex;
    let selectRegionList = that.data.selectRegionList;

    //判断是否可点击
    if (regionTypeIndex + 1 == this.data.regionType || (regionTypeIndex - 1 >= 0 && selectRegionList[regionTypeIndex - 1].code <= 0)) {
      return false;
    }

    let selectRegionItem = selectRegionList[regionTypeIndex];
    let level = regionTypeIndex + 1;
    let pid = 0;
    if (regionTypeIndex === 1) {
      pid = selectRegionList[0].id || 0;
    } else if (regionTypeIndex === 2) {
      pid = selectRegionList[1].id || 0;
    }

    that.loadRegions(level, pid, selectRegionItem.code).then(function(regionList) {
      that.setData({
        regionList: markSelected(regionList, selectRegionItem.code),
        regionType: level
      });
      that.setRegionDoneStatus();
    });
  },
  selectRegion(event) {
    let that = this;
    let regionIndex = event.target.dataset.regionIndex;
    let regionItem = this.data.regionList[regionIndex];
    let regionType = this.data.regionType;
    let selectRegionList = this.data.selectRegionList;
    selectRegionList[regionType - 1] = regionItem;

    if (regionType == 3) {
      this.setData({
        selectRegionList: selectRegionList,
        regionList: markSelected(that.data.regionList, regionItem.code)
      })

      this.setRegionDoneStatus();
      return
    }

    //重置下级区域为空
    selectRegionList.map((item, index) => {
      if (index > regionType - 1) {
        item.id = 0;
        item.code = 0;
        item.name = index == 1 ? '城市' : '区县';
      }
      return item;
    });

    this.setData({
      selectRegionList: selectRegionList,
      regionType: regionType + 1
    })

    let nextLevel = regionType + 1;
    that.loadRegions(nextLevel, regionItem.id || 0, regionItem.code).then(function(regionList) {
      that.setData({
        regionList: regionList
      })
      that.setRegionDoneStatus();
    });
  },
  doneSelectRegion() {
    if (this.data.selectRegionDone === false) {
      return false;
    }

    let address = this.data.address;
    let selectRegionList = this.data.selectRegionList;
    address.province = selectRegionList[0].name;
    address.city = selectRegionList[1].name;
    address.county = selectRegionList[2].name;
    address.areaCode = selectRegionList[2].code;

    this.setData({
      address: address,
      openSelectRegion: false
    });

  },
  cancelSelectRegion() {
    this.setData({
      openSelectRegion: false,
      regionType: this.data.regionDoneStatus ? 3 : 1
    });

  },
  cancelAddress() {
    wx.navigateBack();
  },
  saveAddress() {
    console.log(this.data.address)
    let address = this.data.address;

    if (address.name == '') {
      util.showErrorToast('请输入姓名');

      return false;
    }

    if (address.tel == '') {
      util.showErrorToast('请输入手机号码');
      return false;
    }

    if (!check.isValidPhone(address.tel)) {
      util.showErrorToast('请输入11位手机号');
      return false;
    }

    if (address.areaCode == 0) {
      util.showErrorToast('请输入省市区');
      return false;
    }

    if (address.addressDetail == '') {
      util.showErrorToast('请输入详细地址');
      return false;
    }

    let that = this;
    util.request(api.AddressSave, {
      id: address.id,
      name: address.name,
      tel: address.tel,
      province: address.province,
      city: address.city,
      county: address.county,
      areaCode: address.areaCode,
      addressDetail: address.addressDetail,
      isDefault: address.isDefault
    }, 'POST').then(function(res) {
      if (res.errno === 0) {
        //返回之前，先取出上一页对象，并设置addressId
        var pages = getCurrentPages();
        var prevPage = pages[pages.length - 2];
        console.log(prevPage);
        if (prevPage.route == "pages/checkout/checkout") {
          prevPage.setData({
            addressId: res.data
          })

          try {
            wx.setStorageSync('addressId', res.data);
          } catch (e) {

          }
          console.log("set address");
        }
        wx.navigateBack();
      } else {
        util.showErrorToast(res.errmsg || '保存失败');
      }
    });

  },
  onShow: function() {
    // 页面显示
  },
  onHide: function() {
    // 页面隐藏

  },
  onUnload: function() {
    // 页面关闭

  }
})
