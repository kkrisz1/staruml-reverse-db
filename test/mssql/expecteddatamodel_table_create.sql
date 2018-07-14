-- Database: user
-- DROP TABLE person CASCADE;
-- DROP TABLE dog CASCADE;
-- DROP TABLE department CASCADE;

-- docker exec -it mssql_db_1 /opt/mssql-tools/bin/sqlcmd -e -S localhost -U test_user -P password01@
USE test;
GO
CREATE TABLE test_user.department (    id integer NOT NULL,    sysid integer NOT NULL,    name varchar(128) NOT NULL,    PRIMARY KEY (id, sysid));
GO
CREATE TABLE test_user.person (    id bigint NOT NULL,    name varchar(32) NOT NULL,    age integer NOT NULL,    identity_card_no char(16) NOT NULL,    driver_licence_no char(16),    department_id integer,    department_sysid integer,    PRIMARY KEY (id),    FOREIGN KEY (department_id, department_sysid) REFERENCES test_user.department (id, sysid));
GO
ALTER TABLE test_user.person    ADD UNIQUE (identity_card_no, driver_licence_no);
GO
CREATE TABLE test_user.dog (    id bigint NOT NULL,    name varchar(32) NOT NULL,    owner bigint,    chip_no char(128) NOT NULL,    PRIMARY KEY (id),    FOREIGN KEY (owner) REFERENCES test_user.person (id));
GO
