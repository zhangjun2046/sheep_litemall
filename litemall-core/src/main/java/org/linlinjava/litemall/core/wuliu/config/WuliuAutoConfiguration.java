package org.linlinjava.litemall.core.wuliu.config;

import org.linlinjava.litemall.core.express.ExpressService;
import org.linlinjava.litemall.core.wuliu.WuliuService;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(WuliuProperties.class)
public class WuliuAutoConfiguration {

    @Bean
    public WuliuService wuliuService(WuliuProperties properties, ExpressService expressService) {
        return new WuliuService(properties, expressService);
    }
}
