package com.chemreg.chemreg.sds.service;

import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Component
public class LocalSdsBinaryStorage implements SdsBinaryStorage {

    private final Path rootPath;

    public LocalSdsBinaryStorage(SdsStorageProperties properties) {
        this.rootPath = Paths.get(properties.getRoot()).toAbsolutePath().normalize();
    }

    @Override
    public String store(UUID documentId, UUID fileId, String originalFilename, byte[] content) throws IOException {
        String safeFilename = sanitizeFilename(originalFilename);
        Path targetDirectory = rootPath.resolve(documentId.toString());
        Files.createDirectories(targetDirectory);

        String storedFilename = fileId + "-" + safeFilename;
        Path targetFile = targetDirectory.resolve(storedFilename).normalize();
        if (!targetFile.startsWith(rootPath)) {
            throw new IOException("Resolved SDS storage path escaped the configured root.");
        }

        Files.write(targetFile, content);
        return rootPath.relativize(targetFile).toString().replace('\\', '/');
    }

    @Override
    public byte[] read(String storageKey) throws IOException {
        Path resolvedPath = rootPath.resolve(storageKey).normalize();
        if (!resolvedPath.startsWith(rootPath)) {
            throw new IOException("Resolved SDS storage path escaped the configured root.");
        }

        return Files.readAllBytes(resolvedPath);
    }

    private String sanitizeFilename(String value) {
        if (value == null || value.isBlank()) {
            return "upload.bin";
        }

        return value.replaceAll("[^A-Za-z0-9._-]", "_");
    }
}
