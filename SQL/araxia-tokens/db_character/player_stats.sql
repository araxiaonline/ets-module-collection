
-- TABLE FOR PLAYER STATS AND SETTINGS
CREATE TABLE `acore_characters`.`player_stats` (
  `id` int NOT NULL, -- GUID of player
  `name` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `value` int DEFAULT '0',
  `updated` int DEFAULT NULL,
  PRIMARY KEY (`id`,`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
