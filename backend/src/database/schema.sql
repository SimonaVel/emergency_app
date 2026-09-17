-- Table definitions for the emergency_app database.
--
-- Loaded automatically by initDb.ts every time the database is
-- initialized. Tables are created with IF NOT EXISTS / in dependency
-- order so re-running this file is safe.

CREATE TABLE IF NOT EXISTS `emergency_types` (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS `emergencies` (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    emergency_type_id BIGINT,
    FOREIGN KEY (emergency_type_id) REFERENCES `emergency_types` (`id`)
);

CREATE TABLE IF NOT EXISTS `incident_statuses` (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    status VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS `incident` (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    date DATETIME NOT NULL,
    status_id BIGINT NOT NULL,
    emergency_id BIGINT NOT NULL,
    FOREIGN KEY (`status_id`) REFERENCES `incident_statuses` (`id`),
    FOREIGN KEY (`emergency_id`) REFERENCES `emergencies` (`id`)
);

CREATE TABLE IF NOT EXISTS `reporter` (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS `incidents_have_reporters` (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    incident_id BIGINT NOT NULL,
    reporter_id BIGINT NOT NULL,
    FOREIGN KEY (`incident_id`) REFERENCES `incident` (`id`),
    FOREIGN KEY (`reporter_id`) REFERENCES `reporter` (`id`)
);
