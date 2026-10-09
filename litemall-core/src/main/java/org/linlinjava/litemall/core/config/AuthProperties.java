package org.linlinjava.litemall.core.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;

/**
 * 管理端 Session、小程序 JWT 过期时间，单位小时。
 */
@Configuration
@ConfigurationProperties(prefix = "litemall.auth")
public class AuthProperties {

    private static volatile AuthProperties INSTANCE = new AuthProperties();

    /**
     * 管理端 Shiro Session 空闲超时（小时），有请求会按最后访问续期。
     */
    private int adminSessionTimeoutHours = 24;

    /**
     * 小程序 JWT 绝对过期（小时），到期需重新登录。
     */
    private int wxTokenExpireHours = 48;

    @PostConstruct
    public void register() {
        INSTANCE = this;
    }

    public static int resolveWxTokenExpireHours() {
        int hours = INSTANCE.wxTokenExpireHours;
        return hours > 0 ? hours : 48;
    }

    public static int resolveAdminSessionTimeoutHours() {
        int hours = INSTANCE.adminSessionTimeoutHours;
        return hours > 0 ? hours : 24;
    }

    public int getAdminSessionTimeoutHours() {
        return adminSessionTimeoutHours;
    }

    public void setAdminSessionTimeoutHours(int adminSessionTimeoutHours) {
        this.adminSessionTimeoutHours = adminSessionTimeoutHours;
    }

    public int getWxTokenExpireHours() {
        return wxTokenExpireHours;
    }

    public void setWxTokenExpireHours(int wxTokenExpireHours) {
        this.wxTokenExpireHours = wxTokenExpireHours;
    }
}
