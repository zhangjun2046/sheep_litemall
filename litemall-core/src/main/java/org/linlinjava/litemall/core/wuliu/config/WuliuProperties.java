package org.linlinjava.litemall.core.wuliu.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "litemall.wuliu")
public class WuliuProperties {
    private String host;
    private String path;
    private String appcode;
    private String sfType;
    private String sfVendorCode;

    public String getHost() {
        return host;
    }

    public void setHost(String host) {
        this.host = host;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getAppcode() {
        return appcode;
    }

    public void setAppcode(String appcode) {
        this.appcode = appcode;
    }

    public String getSfType() {
        return sfType;
    }

    public void setSfType(String sfType) {
        this.sfType = sfType;
    }

    public String getSfVendorCode() {
        return sfVendorCode;
    }

    public void setSfVendorCode(String sfVendorCode) {
        this.sfVendorCode = sfVendorCode;
    }
}
