package org.linlinjava.litemall.core.wuliu;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.linlinjava.litemall.core.express.ExpressService;
import org.linlinjava.litemall.core.wuliu.config.WuliuProperties;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 阿里云市场物流查询。只读，不访问订单表，不修改订单。
 */
public class WuliuService {
    private static final DateTimeFormatter TRACE_TIME = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final String MSG_SF_ONLY = "本期仅支持顺丰";
    private static final String MSG_NO_SN = "暂无快递单号";
    private static final String MSG_PHONE = "收货手机号不足四位，无法查询顺丰";
    private static final String MSG_UNCONFIGURED = "物流查询未配置";
    private static final String MSG_RETRY = "暂时无法查询物流，请稍后再试";
    private static final String DEFAULT_SF_NAME = "顺丰速运";

    private final Log logger = LogFactory.getLog(WuliuService.class);
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final WuliuProperties properties;
    private final ExpressService expressService;

    public WuliuService(WuliuProperties properties, ExpressService expressService) {
        this.properties = properties;
        this.expressService = expressService;
    }

    public WuliuQueryResult query(String shipSn, String mobile, String shipChannel) {
        String expNo = shipSn == null ? "" : shipSn.trim();
        boolean sf = isSf(shipChannel);
        WuliuQueryResult result = new WuliuQueryResult();
        result.setExpNo(expNo);
        result.setExpName(resolveExpName(shipChannel, null, sf));

        if (!sf) {
            result.setMessage(MSG_SF_ONLY);
            return result;
        }
        if (expNo.isEmpty()) {
            result.setMessage(MSG_NO_SN);
            return result;
        }
        String digits = digits(mobile);
        if (digits.length() < 4) {
            result.setMessage(MSG_PHONE);
            return result;
        }
        if (isBlank(properties.getAppcode()) || isBlank(properties.getHost()) || isBlank(properties.getPath())) {
            result.setMessage(MSG_UNCONFIGURED);
            return result;
        }

        String tail = digits.substring(digits.length() - 4);
        try {
            String type = isBlank(properties.getSfType()) ? "SFEXPRESS" : properties.getSfType().trim();
            String query = "no=" + URLEncoder.encode(expNo + ":" + tail, "UTF-8")
                    + "&type=" + URLEncoder.encode(type, "UTF-8");
            String url = joinUrl(properties.getHost().trim(), properties.getPath().trim()) + "?" + query;
            HttpResult http = httpGet(url, properties.getAppcode().trim());
            if (http.status != 200) {
                logger.warn("wuliu query http status " + http.status);
                result.setMessage(MSG_RETRY);
                return result;
            }
            return parseBody(http.body, result, shipChannel, sf);
        } catch (Exception e) {
            logger.error("wuliu query failed");
            result.setMessage(MSG_RETRY);
            return result;
        }
    }

    private WuliuQueryResult parseBody(String body, WuliuQueryResult result, String shipChannel, boolean sf) {
        try {
            JsonNode root = objectMapper.readTree(body);
            String status = root.path("status").asText("");
            if (!"0".equals(status)) {
                logger.warn("wuliu query business status " + status);
                result.setMessage(businessMessage(status));
                return result;
            }
            JsonNode data = root.path("result");
            String upstreamName = data.path("expName").asText("");
            result.setExpName(resolveExpName(shipChannel, upstreamName, sf));
            String deliveryStatus = data.path("deliverystatus").asText("");
            result.setDeliveryStatus(deliveryStatus);
            result.setDeliveryStatusText(deliveryStatusText(deliveryStatus));
            result.setSigned("1".equals(data.path("issign").asText("")));
            result.setTraces(sortTraces(data.path("list")));
            result.setMessage("");
            logger.info("wuliu query ok, traces=" + result.getTraces().size());
            return result;
        } catch (Exception e) {
            logger.error("wuliu query parse failed");
            result.setMessage(MSG_RETRY);
            return result;
        }
    }

    private List<Map<String, String>> sortTraces(JsonNode list) {
        List<TraceItem> timed = new ArrayList<>();
        List<TraceItem> untimed = new ArrayList<>();
        if (list != null && list.isArray()) {
            for (JsonNode node : list) {
                String time = node.path("time").asText("");
                String context = node.path("status").asText("");
                TraceItem item = new TraceItem(time, context);
                try {
                    if (time.isEmpty()) {
                        throw new IllegalArgumentException("empty");
                    }
                    item.parsed = LocalDateTime.parse(time, TRACE_TIME);
                    timed.add(item);
                } catch (Exception ignored) {
                    untimed.add(item);
                }
            }
        }
        timed.sort(Comparator.comparing((TraceItem item) -> item.parsed).reversed());
        List<Map<String, String>> traces = new ArrayList<>();
        for (TraceItem item : timed) {
            traces.add(item.toMap());
        }
        for (TraceItem item : untimed) {
            traces.add(item.toMap());
        }
        return traces;
    }

    private boolean isSf(String shipChannel) {
        String expected = properties.getSfVendorCode();
        if (isBlank(expected) || isBlank(shipChannel)) {
            return false;
        }
        return expected.trim().equalsIgnoreCase(shipChannel.trim());
    }

    private String resolveExpName(String shipChannel, String upstreamName, boolean sf) {
        if (!isBlank(shipChannel)) {
            String vendor = expressService.getVendorName(shipChannel.trim());
            if (!isBlank(vendor)) {
                return vendor;
            }
        }
        if (!isBlank(upstreamName)) {
            return upstreamName.trim();
        }
        if (sf) {
            return DEFAULT_SF_NAME;
        }
        return "";
    }

    private static String deliveryStatusText(String status) {
        if (status == null) {
            return "";
        }
        switch (status) {
            case "0":
                return "已揽收";
            case "1":
                return "运输中";
            case "2":
                return "派送中";
            case "3":
                return "已签收";
            case "4":
                return "派送失败";
            case "5":
                return "疑难件";
            case "6":
                return "退件签收";
            default:
                return "";
        }
    }

    private static String businessMessage(String status) {
        if (status == null) {
            return MSG_RETRY;
        }
        switch (status) {
            case "201":
                return "快递单号错误";
            case "203":
                return "快递公司不存在";
            case "204":
                return "快递公司识别失败";
            case "205":
                return "暂无物流信息";
            default:
                return MSG_RETRY;
        }
    }

    private static String digits(String mobile) {
        if (mobile == null) {
            return "";
        }
        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < mobile.length(); i++) {
            char c = mobile.charAt(i);
            if (c >= '0' && c <= '9') {
                builder.append(c);
            }
        }
        return builder.toString();
    }

    private static boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private static String joinUrl(String host, String path) {
        if (host.endsWith("/") && path.startsWith("/")) {
            return host.substring(0, host.length() - 1) + path;
        }
        if (!host.endsWith("/") && !path.startsWith("/")) {
            return host + "/" + path;
        }
        return host + path;
    }

    private HttpResult httpGet(String url, String appcode) throws Exception {
        HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
        conn.setRequestMethod("GET");
        conn.setConnectTimeout(5000);
        conn.setReadTimeout(8000);
        conn.setRequestProperty("Authorization", "APPCODE " + appcode);
        int status = conn.getResponseCode();
        InputStream stream = status >= 400 ? conn.getErrorStream() : conn.getInputStream();
        String body = read(stream);
        conn.disconnect();
        return new HttpResult(status, body);
    }

    private static String read(InputStream stream) throws Exception {
        if (stream == null) {
            return "";
        }
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8))) {
            StringBuilder builder = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                builder.append(line);
            }
            return builder.toString();
        }
    }

    private static final class HttpResult {
        private final int status;
        private final String body;

        private HttpResult(int status, String body) {
            this.status = status;
            this.body = body;
        }
    }

    private static final class TraceItem {
        private final String time;
        private final String context;
        private LocalDateTime parsed;

        private TraceItem(String time, String context) {
            this.time = time;
            this.context = context;
        }

        private Map<String, String> toMap() {
            Map<String, String> map = new HashMap<>();
            map.put("time", time);
            map.put("context", context);
            return map;
        }
    }
}
