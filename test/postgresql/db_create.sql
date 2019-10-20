-- Database: Untitled
-- Author: 
CREATE DATABASE "user" WITH ENCODING = 'UTF8' CONNECTION LIMIT = -1;
CREATE USER "user" WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE "user" to "user";
