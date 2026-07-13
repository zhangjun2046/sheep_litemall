# sheep_litemall

基于 [litemall](https://github.com/linlinjava/litemall) 的羊肉/生鲜小商城实践仓库。

技术栈：Spring Boot 后端 + Vue 管理后台 + 微信小程序（`litemall-wx`）+ Vue 移动端（可选）。

* 上游文档：[litemall GitBook](https://linlinjava.gitbook.io/litemall)
* 本地联调：[doc/local-startup.md](./doc/local-startup.md)
* 本仓库：[GitHub](https://github.com/zhangjun2046/sheep_litemall)

## 本仓库近期改动

* **结算页选地址**：修复填写订单页选择收货地址不回显的问题（规范化本地缓存 ID、失效 `cartId` 自动回退、结算失败可见提示）
* **微信登录本地联调**：支持 `litemall.wx.mock-enabled`，`code2session` 失败时可用 mock openId 完成登录（上线前务必关闭）
* **小程序图片 HTTPS**：接口响应中的外链 `http://` 自动升级为 `https://`（localhost 除外），避免基础库拦截
* **本地启动说明**：补充 Windows 环境下后端、管理后台、小程序联调与常见问题

## 项目架构

![](./doc/pics/readme/project-structure.png)

## 技术栈

1. Spring Boot
2. Vue
3. 微信小程序

![](doc/pics/readme/technology-stack.png)

## 功能概览

### 小商城

首页、分类、搜索、商品详情、购物车、下单、订单、地址、优惠券、团购等。

### 管理后台

会员、商城、商品、推广、系统、配置、统计报表等。

## 快速启动

更完整的步骤与排障见 **[本地启动指南](./doc/local-startup.md)**。最小流程如下：

1. 准备环境：MySQL、JDK 8+、Maven、Node.js、微信开发者工具
2. 依次导入 `litemall-db/sql/` 下：
   - `litemall_schema.sql`
   - `litemall_table.sql`
   - `litemall_data.sql`
3. 启动后端：

```bash
mvn install
mvn clean package
java -Dfile.encoding=UTF-8 -jar litemall-all/target/litemall-all-0.1.0-exec.jar
```

4. 启动管理后台前端：

```bash
cd litemall-admin
npm install
npm run dev
```

浏览器打开 `http://localhost:9527`。

5. 微信开发者工具导入 `litemall-wx`，关闭域名校验后编译预览。

本地微信登录可将 `litemall.wx.mock-enabled` 设为 `true`（见 `litemall-core/src/main/resources/application-core.yml`）；上线前改为 `false`，并配置真实 `app-id` / `app-secret`。

## 警告

1. 本项目主要用于学习与业务实践
2. 生产环境请自行替换微信、支付、短信等第三方配置，关闭 mock 登录
3. 上游代码开源协议为 [MIT](./LICENSE)；文档采用 [署名-禁止演绎 4.0](https://creativecommons.org/licenses/by-nd/4.0/deed.zh)

## 致谢

本项目基于 [linlinjava/litemall](https://github.com/linlinjava/litemall)，并参考 nideshop-mini-program、vue-element-admin、mall-admin-web、biu、vant--mobile-mall 等开源项目。

## License

[MIT](./LICENSE)
