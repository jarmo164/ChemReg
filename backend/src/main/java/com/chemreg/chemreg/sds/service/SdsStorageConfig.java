package com.chemreg.chemreg.sds.service;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(SdsStorageProperties.class)
public class SdsStorageConfig {
}
