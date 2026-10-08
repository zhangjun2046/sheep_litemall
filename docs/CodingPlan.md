# CodingPlan：微信小程序首页商品区域卡片对标设计稿调优

> 使用 Gemini 3.8 Flash 完成。

## 一、需求背景

微信小程序首页（`litemall-wx/pages/index`）商品信息区域（商品长图 + 底部价格）在原版展示中缺乏明确的卡片化视觉边界，导致价格与上下商品图片的从属关系容易混淆。为提升用户体验并对标 UI 设计师最新设计稿，对首页商品区域进行视觉调优：

1. **独立卡片流（Card UI）**：构建独立白色圆角卡片，放大卡片尺寸至 `722rpx`，左右留白收窄至 `14rpx`，最大化呈现商品海报图。
2. **卡片底栏与间距优化**：卡片间距统一收紧为 `14rpx`；卡片底部增设操作底栏容器，价格靠右侧展示，去除冗余按钮。
3. **左右侧阴影加深**：卡片应用复合立体阴影（`0 4rpx 18rpx 2rpx rgba(0, 0, 0, 0.07), 0 2rpx 6rpx rgba(0, 0, 0, 0.04)`），增强左右两侧浮于背景的层次感。

验收通过。

## 二、实现方案

1. **WXML 结构调整**（`litemall-wx/pages/index/index.wxml`）：
   - 将原单行 `<text class="price">` 重构为专属底部容器 `<view class="item-footer">`；
   - 内部包含价格符号与数值的 `<view class="price-box">`，不包含多余的“立即购买”按钮；
   - 卡片整体保持 navigator 包裹，支持点击整张卡片跳转至商品详情页。

2. **WXSS 样式调优**（`litemall-wx/pages/index/index.wxss`）：
   - `.a-popular`：背景设为 `transparent` 显露页面背景色，顶部留白 `margin-top: 14rpx`；
   - `.a-popular .b .item`：宽度放大为 `722rpx`，外边距设为 `0 14rpx 14rpx 14rpx`，圆角设为 `14rpx`，并配置外扩深色复合阴影；
   - `.a-popular .b .img`：宽度设为 `722rpx`，高度自适应；
   - `.a-popular .b .item-footer`：采用 `flex` 布局并靠右对齐（`justify-content: flex-end`），内边距 `8rpx 24rpx 20rpx`；
   - `.a-popular .b .price-box`：采用标准红色 `#d81e06` 与 DIN 字体高亮显示。

## 三、涉及文件

| 文件 | 改动说明 |
| --- | --- |
| `litemall-wx/pages/index/index.wxml` | 调整商品结构为独立卡片结构，增加右对齐价格底栏容器 |
| `litemall-wx/pages/index/index.wxss` | 放大卡片尺寸（722rpx）、缩小上下间距（14rpx）、加深左右侧复合阴影 |
| `docs/CodingPlan.md` | 记录本次商品卡片对标设计稿调优的计划与实现 |
| `README.md` | 更新近期改动说明 |

## 四、验收标准

进入小程序首页：
- 商品以独立卡片流形态呈现，海报开阔通透 ✅
- 卡片左右两侧阴影清晰深邃，悬浮立体感显著 ✅
- 价格清晰呈现于卡片底部右侧，归属明确无歧义 ✅
- 卡片间距紧凑统一（14rpx） ✅
- 点击卡片可正常跳转至对应的商品详情页 ✅
