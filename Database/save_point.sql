-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: games_system
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `favoritos`
--

DROP TABLE IF EXISTS `favoritos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favoritos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `game_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `game_id` (`game_id`),
  CONSTRAINT `favoritos_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `favoritos_ibfk_2` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favoritos`
--

LOCK TABLES `favoritos` WRITE;
/*!40000 ALTER TABLE `favoritos` DISABLE KEYS */;
INSERT INTO `favoritos` VALUES (1,5,7),(2,7,17),(3,7,4);
/*!40000 ALTER TABLE `favoritos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `games`
--

DROP TABLE IF EXISTS `games`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `games` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(100) NOT NULL,
  `genero` varchar(50) DEFAULT NULL,
  `plataforma` varchar(50) DEFAULT NULL,
  `ano_lanc` int DEFAULT NULL,
  `preco` decimal(10,2) DEFAULT NULL,
  `data_cadast` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `url_imagem` text,
  `trofeus` int DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `games`
--

LOCK TABLES `games` WRITE;
/*!40000 ALTER TABLE `games` DISABLE KEYS */;
INSERT INTO `games` VALUES (4,'The Witcher 3','RPG','PC, PS, Xbox, Switch',2015,59.99,'2026-03-27 16:50:23',NULL,78),(7,'Assassins Creed Black Flag','Aventura','Pc, Ps, Xbox',2013,79.90,'2026-03-27 17:39:36',NULL,60),(9,'Elden Ring','Souls-Like','Pc, PS, Xbox',2022,249.99,'2026-03-27 18:17:32',NULL,42),(10,'Resident Evil 2 Remake','Horror, Puzzle','Pc, PS, xbox',2019,89.90,'2026-03-27 18:18:38',NULL,44),(11,'The Evil Within','Horror','pc, xbox, ps',2014,69.90,'2026-03-27 18:43:53',NULL,42),(15,'Resident Evil 4 Remake','horror, ação','pc, xbox, ps',2023,149.99,'2026-03-27 19:09:27',NULL,46),(16,'Dying Light The Beast','açao','Pc, ps, xbox',2025,249.99,'2026-03-30 17:56:55',NULL,30),(17,'Resident Evil Requiem','ação, Horror','pc, ps, xbox',2026,249.99,'2026-04-01 16:37:35',NULL,49),(18,'The Last of Us Part II','ação','pc, ps',2020,249.99,'2026-04-01 18:35:34',NULL,45),(19,'Marvel\'s Spider-Man','ação','pc, ps',2018,149.99,'2026-04-02 17:46:11',NULL,72),(21,'Cyberpunk 2077','RPG / FPS','PC , PS, xbox',2020,149.99,'2026-04-02 18:21:51',NULL,45),(22,'Ghost of Tsushima','Ação','pc, ps',2020,249.90,'2026-04-02 18:23:07',NULL,52),(23,'Forza Horizon 5','Corrida','Xbox, PC',2021,219.00,'2026-04-02 18:23:54',NULL,53),(24,'God of War (2018)','ação','pc, ps',2018,149.90,'2026-04-02 18:25:22',NULL,37),(25,'Resident Evil Village','Horror','pc, ps, xbox',2021,139.90,'2026-04-02 18:26:32',NULL,50),(26,'Red Dead Redemption 2','Mundo Aberto','pc, ps, xbox',2018,199.00,'2026-04-02 18:27:21',NULL,52),(27,'Marvel\'s Spider-Man 2','Ação / Aventura','pc, ps',2023,349.90,'2026-04-02 18:28:32',NULL,42),(28,'Baldur\'s Gate 3','RPG / Estratégia','PC, ps, xbox',2023,199.99,'2026-04-02 18:29:21',NULL,54),(29,'Sekiro: Shadows Die Twice','Soulslike','pc, ps, xbox',2019,274.50,'2026-04-02 18:30:17',NULL,34);
/*!40000 ALTER TABLE `games` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `noticias`
--

DROP TABLE IF EXISTS `noticias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `noticias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `imagem_url` text NOT NULL,
  `categoria` varchar(50) NOT NULL,
  `data_post` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `noticias`
--

LOCK TABLES `noticias` WRITE;
/*!40000 ALTER TABLE `noticias` DISABLE KEYS */;
INSERT INTO `noticias` VALUES (1,'Novidades do patch de expansão de final de ano: Novos mapas e balanceamento de armas','https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600','atualizacoes','2026-05-29 18:10:12'),(2,'Próximos campeonatos e eventos competitivos agendados para este trimestre','https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600','eventos','2026-05-29 18:10:12'),(3,'Análise Completa: Vale a pena investir no novo RPG de ação em mundo aberto?','https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=600','lancamentos','2026-05-29 18:10:12'),(4,'Comunidade ativa: Os melhores mods criados pelos jogadores nesta semana','https://images.unsplash.com/photo-1560253023-3ec5d502959f?q=80&w=600','comunidade','2026-05-29 18:10:12'),(5,'Guia definitivo: Como derrotar o chefe secreto do novo Ato e conseguir o set lendário','https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=600','guia','2026-05-29 18:10:12'),(6,'Tabela do Ranking Mensal: Veja quem dominou o servidor na última temporada','https://images.unsplash.com/photo-1548685913-fe6574340a63?q=80&w=600','ranking','2026-05-29 18:10:12');
/*!40000 ALTER TABLE `noticias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `game_id` int NOT NULL,
  `user_id` int NOT NULL,
  `texto` text NOT NULL,
  `tipo` enum('positiva','negativa') NOT NULL DEFAULT 'positiva',
  `data_coment` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `game_id` (`game_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,7,4,'muito bom o jogo','positiva','2026-05-29 17:09:57'),(2,7,5,'jogo horrivel meu deus apaga isso\n','negativa','2026-05-29 17:11:36'),(3,4,6,'esse jogo é maravilhoso','positiva','2026-06-11 17:36:10'),(4,17,7,'O jogo começa muito bem Rhodes Hill é foda demais, porém não vou mentir em raccoon city as coisas dão uma caida fica meio genérico, mas segue sendo um puta jogo bom','positiva','2026-06-11 18:00:18');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `bio` varchar(255) DEFAULT NULL,
  `avatar_url` text,
  `membro_desde` varchar(10) DEFAULT '2026',
  `role` enum('user','curator','admin') DEFAULT 'user',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (4,'admin_savepoint','admin@savepoint.com','admin123','Administrador do Save Point',NULL,'2026','admin'),(5,'curador_savepoint','curador@savepoint.com','curador123','Crítico oficial do Save Point',NULL,'2026','curator'),(6,'lucas_ferraz','lucas@savepoint.com','lucas123','Membro da comunidade Save Point',NULL,'2026','user'),(7,'Lucas Ferraz','lucasferrazsantos@hotmail.com','Topgun@10',NULL,NULL,'2026','user');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-11 16:02:08
