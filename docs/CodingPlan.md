# CodingPlan：隐藏微信小程序「个人中心」三个功能入口

> 使用 deepseek-v4-pro 完成。

## 一、需求背景

微信小程序「我的」页签对应的「个人中心」页面（`litemall-wx/pages/ucenter/index`）中，需要隐藏以下三个功能入口：

1. **售后**（`goAfterSale`）
2. **优惠卷**（`goCoupon`）
3. **我的拼团**（`goGroupon`）

验收通过。

## 二、实现方案

采用 **features 配置开关** 的方式控制入口显隐，而非直接删除代码，便于后续按需恢复：

- 新增配置文件 `litemall-wx/config/features.js`，集中声明三个开关：

```js
module.exports = {
  enableAftersale: false,
  enableCoupon: false,
  enableGroupon: false
};
```

- 在页面逻辑 `litemall-wx/pages/ucenter/index/index.js` 中引入该配置，并挂载到页面 `data`：

```js
var features = require('../../../config/features.js');

data: {
  enableAftersale: features.enableAftersale,
  enableCoupon: features.enableCoupon,
  enableGroupon: features.enableGroupon,
}
```

- 在页面模板 `litemall-wx/pages/ucenter/index/index.wxml` 中，为三个入口节点追加 `wx:if` 条件渲染：

```xml
<view class='user_column_item' bindtap='goAfterSale' wx:if="{{enableAftersale}}">售后</view>
<view class='user_column_item' bindtap='goCoupon' wx:if="{{enableCoupon}}">优惠卷</view>
<view class='user_column_item' bindtap='goGroupon' wx:if="{{enableGroupon}}">我的拼团</view>
```

当开关为 `false` 时，对应入口不会渲染，达到隐藏效果；需要恢复时只需将对应开关改为 `true`。

## 三、涉及文件

| 文件 | 改动说明 |
| --- | --- |
| `litemall-wx/config/features.js` | 新增，集中声明三个功能开关 |
| `litemall-wx/pages/ucenter/index/index.js` | 引入开关并挂载到 `data` |
| `litemall-wx/pages/ucenter/index/index.wxml` | 三个入口节点增加 `wx:if` 条件渲染 |

## 四、验收标准

进入小程序「我的」页签 → 「个人中心」页面：

- 「售后」入口不可见 ✅
- 「优惠卷」入口不可见 ✅
- 「我的拼团」入口不可见 ✅