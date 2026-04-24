package com.chemreg.chemreg.sds.service;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.sds.storage")
public class SdsStorageProperties {

    /**
     * Root directory for locally stored SDS file binaries in MVP mode.
     */
    private String root = System.getProperty("java.io.tmpdir") + "/chemreg-sds-storage";

    public String getRoot() {
        return root;
    }

    public void setRoot(String root) {
        this.root = root;
    }
}
