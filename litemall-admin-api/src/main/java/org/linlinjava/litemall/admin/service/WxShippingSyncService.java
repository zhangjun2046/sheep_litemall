package org.linlinjava.litemall.admin.service;

import cn.binarywang.wx.miniapp.api.WxMaService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import me.chanjar.weixin.common.error.WxErrorException;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.linlinjava.litemall.core.util.RegexUtil;
import org.linlinjava.litemall.db.domain.LitemallOrder;
import org.linlinjava.litemall.db.domain.LitemallOrderGoods;
import org.linlinjava.litemall.db.domain.LitemallUser;
import org.linlinjava.litemall.db.service.LitemallOrderGoodsService;
import org.linlinjava.litemall.db.service.LitemallUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class WxShippingSyncService {
    private static final String UPLOAD_URL = "https://api.weixin.qq.com/wxa/sec/order/upload_shipping_info";
    /**
     * 微信运力列表 get_delivery_list 中「顺丰速运」的编码。
     */
    private static final String EXPRESS_COMPANY = "SF";
    private static final int ITEM_DESC_LIMIT = 120;
    private static final DateTimeFormatter UPLOAD_TIME = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");

    private final Log logger = LogFactory.getLog(WxShippingSyncService.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private WxMaService wxMaService;
    @Autowired
    private LitemallUserService userService;
    @Autowired
    private LitemallOrderGoodsService orderGoodsService;
    @Autowired
    private LogHelper logHelper;

    public Map<String, Object> sync(LitemallOrder order, String shipSn) {
        Map<String, Object> wxSync = new HashMap<>();
        wxSync.put("success", false);
        wxSync.put("skipped", false);
        wxSync.put("message", "");

        String skipReason = skipReason(order);
        if (skipReason != null) {
            wxSync.put("skipped", true);
            wxSync.put("message", skipReason);
            logHelper.logOrderFail("微信发货同步", detail(order, shipSn) + "，" + skipReason);
            return wxSync;
        }

        LitemallUser user = userService.findById(order.getUserId());
        String openid = user == null ? null : user.getWeixinOpenid();
        if (!StringUtils.hasText(openid)) {
            wxSync.put("skipped", true);
            wxSync.put("message", "下单用户没有微信openid");
            logHelper.logOrderFail("微信发货同步", detail(order, shipSn) + "，下单用户没有微信openid");
            return wxSync;
        }

        try {
            wxMaService.post(UPLOAD_URL, requestJson(order, shipSn, openid));
            wxSync.put("success", true);
            logHelper.logOrderSucceed("微信发货同步", detail(order, shipSn));
        } catch (WxErrorException e) {
            if (isTimeout(e)) {
                wxSync.put("message", "微信接口超时");
            } else {
                String errmsg = e.getError() == null ? e.getMessage() : e.getError().getErrorMsg();
                wxSync.put("message", "微信返回：" + (errmsg == null ? "未知错误" : errmsg));
            }
            logger.warn("微信发货同步失败，" + detail(order, shipSn), e);
            logHelper.logOrderFail("微信发货同步", detail(order, shipSn) + "，" + wxSync.get("message"));
        } catch (Exception e) {
            wxSync.put("message", isTimeout(e) ? "微信接口超时" : exceptionMessage(e));
            logger.warn("微信发货同步失败，" + detail(order, shipSn), e);
            logHelper.logOrderFail("微信发货同步", detail(order, shipSn) + "，" + wxSync.get("message"));
        }
        return wxSync;
    }

    private String skipReason(LitemallOrder order) {
        if (!StringUtils.hasText(order.getPayId())) {
            return "订单没有微信支付单号";
        }
        if (!RegexUtil.isMobileSimple(order.getMobile())) {
            return "收货人手机号格式不正确";
        }
        return null;
    }

    private String requestJson(LitemallOrder order, String shipSn, String openid) throws Exception {
        ObjectNode root = objectMapper.createObjectNode();
        ObjectNode orderKey = root.putObject("order_key");
        orderKey.put("order_number_type", 2);
        orderKey.put("transaction_id", order.getPayId());
        root.put("logistics_type", 1);
        root.put("delivery_mode", 1);
        ArrayNode shippingList = root.putArray("shipping_list");
        ObjectNode shipping = shippingList.addObject();
        shipping.put("tracking_no", shipSn);
        shipping.put("express_company", EXPRESS_COMPANY);
        shipping.put("item_desc", itemDesc(order.getId()));
        shipping.putObject("contact").put("receiver_contact", maskMobile(order.getMobile()));
        root.put("upload_time", UPLOAD_TIME.format(ZonedDateTime.now(ZoneId.of("Asia/Shanghai"))));
        root.putObject("payer").put("openid", openid);
        return objectMapper.writeValueAsString(root);
    }

    private String itemDesc(Integer orderId) {
        List<LitemallOrderGoods> goodsList = orderGoodsService.queryByOid(orderId);
        StringBuilder desc = new StringBuilder();
        if (goodsList != null) {
            for (LitemallOrderGoods goods : goodsList) {
                if (desc.length() > 0) {
                    desc.append("、");
                }
                desc.append(goods.getGoodsName() == null ? "商品" : goods.getGoodsName());
                desc.append("*");
                desc.append(goods.getNumber() == null ? 1 : goods.getNumber());
            }
        }
        if (desc.length() == 0) {
            desc.append("商品");
        }
        if (desc.length() <= ITEM_DESC_LIMIT) {
            return desc.toString();
        }
        return desc.substring(0, ITEM_DESC_LIMIT);
    }

    private String maskMobile(String mobile) {
        return mobile.substring(0, 3) + "****" + mobile.substring(7);
    }

    private String detail(LitemallOrder order, String shipSn) {
        return "订单编号 " + order.getOrderSn() + "，快递单号 " + shipSn;
    }

    private String exceptionMessage(Exception e) {
        return StringUtils.hasText(e.getMessage()) ? e.getMessage() : "微信接口异常";
    }

    private boolean isTimeout(Throwable error) {
        Throwable current = error;
        while (current != null) {
            String name = current.getClass().getName().toLowerCase();
            String message = current.getMessage() == null ? "" : current.getMessage().toLowerCase();
            if (name.contains("timeout") || message.contains("timeout") || message.contains("timed out")) {
                return true;
            }
            current = current.getCause();
        }
        return false;
    }
}
