package org.linlinjava.litemall.core.wuliu;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 物流查询展示结果。不包含请求上游时拼接的手机号后四位。
 */
public class WuliuQueryResult {
    private String message = "";
    private String expName = "";
    private String expNo = "";
    private String deliveryStatus = "";
    private String deliveryStatusText = "";
    private boolean signed;
    private List<Map<String, String>> traces = new ArrayList<>();

    public Map<String, Object> toData() {
        Map<String, Object> data = new HashMap<>();
        data.put("message", message);
        data.put("expName", expName);
        data.put("expNo", expNo);
        data.put("deliveryStatus", deliveryStatus);
        data.put("deliveryStatusText", deliveryStatusText);
        data.put("signed", signed);
        data.put("traces", traces);
        return data;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getExpName() {
        return expName;
    }

    public void setExpName(String expName) {
        this.expName = expName;
    }

    public String getExpNo() {
        return expNo;
    }

    public void setExpNo(String expNo) {
        this.expNo = expNo;
    }

    public String getDeliveryStatus() {
        return deliveryStatus;
    }

    public void setDeliveryStatus(String deliveryStatus) {
        this.deliveryStatus = deliveryStatus;
    }

    public String getDeliveryStatusText() {
        return deliveryStatusText;
    }

    public void setDeliveryStatusText(String deliveryStatusText) {
        this.deliveryStatusText = deliveryStatusText;
    }

    public boolean isSigned() {
        return signed;
    }

    public void setSigned(boolean signed) {
        this.signed = signed;
    }

    public List<Map<String, String>> getTraces() {
        return traces;
    }

    public void setTraces(List<Map<String, String>> traces) {
        this.traces = traces;
    }
}
