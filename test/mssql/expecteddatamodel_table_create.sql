-- Database: user
-- DROP TABLE person CASCADE;
-- DROP TABLE dog CASCADE;
-- DROP TABLE department CASCADE;

-- docker exec -it mssql_db_1 /opt/mssql-tools/bin/sqlcmd -e -S localhost -U test_user -P password01@
USE test;
GO
CREATE TABLE test_user.department (
    id integer NOT NULL,
    sysid integer NOT NULL,
    name varchar(128) NOT NULL,
    PRIMARY KEY (id, sysid));
GO
DECLARE @CurrentUser sysname
SELECT @CurrentUser = user_name()
EXECUTE sp_addextendedproperty 'MS_Description', 'Department', 'user', @CurrentUser, 'table', 'department'
GO
DECLARE @CurrentUser sysname
SELECT @CurrentUser = user_name()
EXECUTE sp_addextendedproperty 'MS_Description', 'Department ID', 'user', @CurrentUser, 'table', 'department', 'column', 'id'
GO
DECLARE @CurrentUser sysname
SELECT @CurrentUser = user_name()
EXECUTE sp_addextendedproperty 'MS_Description', 'Department system ID', 'user', @CurrentUser, 'table', 'department', 'column', 'sysid'
GO
DECLARE @CurrentUser sysname
SELECT @CurrentUser = user_name()
EXECUTE sp_addextendedproperty 'MS_Description', 'Department name', 'user', @CurrentUser, 'table', 'department', 'column', 'name'
GO

CREATE TABLE test_user.person (
    id bigint NOT NULL,
    name varchar(32) NOT NULL,
    age integer NOT NULL,
    identity_card_no char(16) NOT NULL,
    driver_licence_no char(16),
    department_id integer,
    department_sysid integer,
    PRIMARY KEY (id),
    FOREIGN KEY (department_id, department_sysid) REFERENCES test_user.department (id, sysid));
GO
DECLARE @CurrentUser sysname
SELECT @CurrentUser = user_name()
EXECUTE sp_addextendedproperty 'MS_Description', 'Person', 'user', @CurrentUser, 'table', 'person'
GO
DECLARE @CurrentUser sysname
SELECT @CurrentUser = user_name()
EXECUTE sp_addextendedproperty 'MS_Description', 'Person ID', 'user', @CurrentUser, 'table', 'person', 'column', 'id'
GO
DECLARE @CurrentUser sysname
SELECT @CurrentUser = user_name()
EXECUTE sp_addextendedproperty 'MS_Description', 'Person age', 'user', @CurrentUser, 'table', 'person', 'column', 'age'
GO
DECLARE @CurrentUser sysname
SELECT @CurrentUser = user_name()
EXECUTE sp_addextendedproperty 'MS_Description', 'Person name', 'user', @CurrentUser, 'table', 'person', 'column', 'name'
GO
DECLARE @CurrentUser sysname
SELECT @CurrentUser = user_name()
EXECUTE sp_addextendedproperty 'MS_Description', 'National identity card number', 'user', @CurrentUser, 'table', 'person', 'column', 'identity_card_no'
GO
DECLARE @CurrentUser sysname
SELECT @CurrentUser = user_name()
EXECUTE sp_addextendedproperty 'MS_Description', 'Driver license number', 'user', @CurrentUser, 'table', 'person', 'column', 'driver_licence_no'
GO
DECLARE @CurrentUser sysname
SELECT @CurrentUser = user_name()
EXECUTE sp_addextendedproperty 'MS_Description', 'Department ID', 'user', @CurrentUser, 'table', 'person', 'column', 'department_id'
GO
DECLARE @CurrentUser sysname
SELECT @CurrentUser = user_name()
EXECUTE sp_addextendedproperty 'MS_Description', 'Department system ID', 'user', @CurrentUser, 'table', 'person', 'column', 'department_sysid'
GO

ALTER TABLE test_user.person
    ADD UNIQUE (identity_card_no, driver_licence_no);
GO
CREATE TABLE test_user.dog (
    id bigint NOT NULL,
    name varchar(32) NOT NULL,
    owner bigint,
    chip_no char(128) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (owner) REFERENCES test_user.person (id));
GO
DECLARE @CurrentUser sysname
SELECT @CurrentUser = user_name()
EXECUTE sp_addextendedproperty 'MS_Description', 'Dog', 'user', @CurrentUser, 'table', 'dog'
GO
DECLARE @CurrentUser sysname
SELECT @CurrentUser = user_name()
EXECUTE sp_addextendedproperty 'MS_Description', 'Dog ID', 'user', @CurrentUser, 'table', 'dog', 'column', 'id'
GO
DECLARE @CurrentUser sysname
SELECT @CurrentUser = user_name()
EXECUTE sp_addextendedproperty 'MS_Description', 'Dog name', 'user', @CurrentUser, 'table', 'dog', 'column', 'name'
GO
DECLARE @CurrentUser sysname
SELECT @CurrentUser = user_name()
EXECUTE sp_addextendedproperty 'MS_Description', 'Dog owner', 'user', @CurrentUser, 'table', 'dog', 'column', 'owner'
GO
DECLARE @CurrentUser sysname
SELECT @CurrentUser = user_name()
EXECUTE sp_addextendedproperty 'MS_Description', 'Chip number', 'user', @CurrentUser, 'table', 'dog', 'column', 'chip_no'
GO
