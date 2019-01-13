-- Database: Untitled
-- Author:
CREATE DATABASE test;
GO
CREATE LOGIN test_user WITH PASSWORD = N'password01@', DEFAULT_DATABASE = test;
GO
DENY VIEW ANY DATABASE TO test_user;
GO
USE test;
GO
CREATE USER test_user FOR LOGIN test_user WITH DEFAULT_SCHEMA = test_user;
GO
CREATE SCHEMA test_user GRANT SELECT ON SCHEMA::test_user TO test_user;
GO
EXEC sp_addrolemember N'db_owner', N'test_user'
GO
