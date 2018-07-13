-- Database: Untitled
-- Author: 
CREATE DATABASE IF NOT EXISTS user CHARACTER SET  = 'UTF8';
CREATE USER IF NOT EXISTS 'user'@'%' IDENTIFIED BY 'password';
GRANT ALL ON `user`.* TO 'user'@'%';
