package org.linlinjava.litemall.core.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * 小程序服务到期年份（与手机当前年相等则提示过期）。
 */
@Configuration
@ConfigurationProperties(prefix = "litemall.license")
public class LicenseProperties {

    /**
     * 到期年份，例如 2028。为空则不限制。
     */
    private String expireYear = "";

    public String getExpireYear() {
        return expireYear == null ? "" : expireYear.trim();
    }

    public void setExpireYear(String expireYear) {
        this.expireYear = expireYear;
    }
}
