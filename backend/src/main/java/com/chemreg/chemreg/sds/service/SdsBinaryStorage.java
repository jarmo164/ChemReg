package com.chemreg.chemreg.sds.service;

import java.io.IOException;
import java.util.UUID;

public interface SdsBinaryStorage {

    String store(UUID documentId, UUID fileId, String originalFilename, byte[] content) throws IOException;

    byte[] read(String storageKey) throws IOException;
}
