package com.chemreg.chemreg.notification.repository;

import com.chemreg.chemreg.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
List<Notification> findByUserId(UUID userId);
}
