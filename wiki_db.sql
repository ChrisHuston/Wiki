CREATE DATABASE  IF NOT EXISTS `wiki` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `wiki`;
-- MySQL dump 10.13  Distrib 5.6.24, for osx10.8 (x86_64)
--
-- Host: localhost    Database: wiki
-- ------------------------------------------------------
-- Server version	5.5.36

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `comments` (
  `post_id` bigint(20) unsigned NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  `comment_id` bigint(20) unsigned NOT NULL,
  `comment_txt` text NOT NULL,
  `comment_date` datetime NOT NULL,
  `wc` smallint(5) unsigned NOT NULL,
  `is_anon` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `wiki_id` mediumint(8) unsigned NOT NULL,
  `page_id` int(10) unsigned NOT NULL,
  `heading_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`post_id`,`user_id`,`comment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `headings`
--

DROP TABLE IF EXISTS `headings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `headings` (
  `heading_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `wiki_id` int(10) unsigned NOT NULL,
  `page_id` int(10) unsigned NOT NULL,
  `creator_id` int(10) unsigned NOT NULL,
  `heading_name` varchar(128) NOT NULL,
  `prev` int(10) unsigned NOT NULL,
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`heading_id`)
) ENGINE=InnoDB AUTO_INCREMENT=900 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `likes`
--

DROP TABLE IF EXISTS `likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `likes` (
  `post_id` bigint(20) unsigned NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  `wiki_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`post_id`,`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `logins`
--

DROP TABLE IF EXISTS `logins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `logins` (
  `user_id` int(10) unsigned NOT NULL,
  `login_date` datetime NOT NULL,
  `wiki_id` int(10) unsigned NOT NULL,
  `os` varchar(128) NOT NULL,
  PRIMARY KEY (`user_id`,`login_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `micro_posts`
--

DROP TABLE IF EXISTS `micro_posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `micro_posts` (
  `post_id` bigint(20) unsigned NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  `micro_id` bigint(20) unsigned NOT NULL,
  `micro_txt` text NOT NULL,
  `micro_date` datetime NOT NULL,
  `wc` smallint(5) unsigned NOT NULL,
  `is_anon` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `wiki_id` mediumint(8) unsigned NOT NULL,
  `page_id` int(10) unsigned NOT NULL,
  `heading_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`post_id`,`user_id`,`micro_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `page_views`
--

DROP TABLE IF EXISTS `page_views`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `page_views` (
  `net_id` varchar(12) NOT NULL,
  `page_id` mediumint(8) unsigned NOT NULL,
  `view_date` datetime NOT NULL,
  `wiki_id` mediumint(8) unsigned NOT NULL,
  PRIMARY KEY (`net_id`,`page_id`,`view_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pages`
--

DROP TABLE IF EXISTS `pages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pages` (
  `page_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `page_name` varchar(128) NOT NULL,
  `creator_id` int(10) unsigned NOT NULL,
  `creation_date` datetime NOT NULL,
  `prev` int(10) unsigned NOT NULL,
  `wiki_id` int(11) NOT NULL,
  PRIMARY KEY (`page_id`)
) ENGINE=InnoDB AUTO_INCREMENT=270 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `posts` (
  `post_id` bigint(20) unsigned NOT NULL,
  `version` smallint(5) unsigned NOT NULL DEFAULT '1',
  `wiki_id` int(10) unsigned NOT NULL,
  `page_id` int(10) unsigned NOT NULL,
  `heading_id` int(10) unsigned NOT NULL,
  `creator_id` int(10) unsigned NOT NULL,
  `creation_date` datetime NOT NULL,
  `edit_date` datetime NOT NULL,
  `post_txt` text NOT NULL,
  `prev` int(10) unsigned NOT NULL,
  `wc` smallint(5) NOT NULL,
  `is_anon` tinyint(1) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`post_id`,`version`,`heading_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_uploads`
--

DROP TABLE IF EXISTS `user_uploads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_uploads` (
  `upload_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `wiki_id` int(10) unsigned NOT NULL,
  `page_id` int(10) unsigned NOT NULL,
  `heading_id` int(10) unsigned NOT NULL,
  `type_id` tinyint(1) unsigned NOT NULL,
  `file_name` varchar(128) NOT NULL,
  `upload_date` datetime NOT NULL,
  PRIMARY KEY (`upload_id`)
) ENGINE=InnoDB AUTO_INCREMENT=198 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `user_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_name` varchar(128) NOT NULL,
  `user_email` varchar(128) NOT NULL,
  `join_date` datetime NOT NULL,
  `priv_level` tinyint(1) unsigned NOT NULL,
  `last_login` datetime NOT NULL,
  `net_id` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `unique_email` (`user_email`)
) ENGINE=InnoDB AUTO_INCREMENT=893 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `video_view_log`
--

DROP TABLE IF EXISTS `video_view_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `video_view_log` (
  `user_id` int(10) unsigned NOT NULL,
  `wiki_id` mediumint(8) unsigned NOT NULL,
  `page_id` mediumint(8) unsigned NOT NULL,
  `videoFile` varchar(45) NOT NULL,
  `view_date` datetime NOT NULL,
  `last_date` datetime NOT NULL,
  `duration` mediumint(8) unsigned NOT NULL,
  `view_times` smallint(5) unsigned NOT NULL,
  PRIMARY KEY (`user_id`,`wiki_id`,`page_id`,`videoFile`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `wiki_users`
--

DROP TABLE IF EXISTS `wiki_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `wiki_users` (
  `wiki_id` mediumint(8) unsigned NOT NULL,
  `user_id` mediumint(8) unsigned NOT NULL,
  `priv_level` tinyint(1) unsigned NOT NULL DEFAULT '1',
  `subscribed` tinyint(1) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`wiki_id`,`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `wikis`
--

DROP TABLE IF EXISTS `wikis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `wikis` (
  `wiki_id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `wiki_name` varchar(128) NOT NULL,
  `description` text,
  `creation_date` datetime NOT NULL,
  `root_folder` varchar(128) NOT NULL,
  `app_folder` varchar(128) NOT NULL,
  `logo_link` varchar(128) NOT NULL,
  `canvas_course_id` mediumint(8) unsigned NOT NULL DEFAULT '0',
  `use_versions` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `use_comments` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `use_anon` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `use_likes` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `add_pages` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `add_sections` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `max_posts` tinyint(2) unsigned NOT NULL DEFAULT '0',
  `is_open` tinyint(1) unsigned NOT NULL DEFAULT '1',
  PRIMARY KEY (`wiki_id`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2015-07-18 15:25:13
