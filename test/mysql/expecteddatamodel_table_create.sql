-- Database: user
-- DROP TABLE person CASCADE;
-- DROP TABLE dog CASCADE;
-- DROP TABLE department CASCADE;
USE user;

CREATE TABLE department (
    id integer NOT NULL COMMENT 'Department ID',
    sysid integer NOT NULL COMMENT 'Department system ID',
    name varchar(128) NOT NULL COMMENT 'Department name',
    PRIMARY KEY (id, sysid)
) COMMENT 'Department';

CREATE TABLE person (
    id bigint NOT NULL COMMENT 'Person ID',
    name varchar(32) NOT NULL COMMENT 'Person name',
    age integer NOT NULL COMMENT 'Person age',
    identity_card_no char(16) NOT NULL COMMENT 'National identity card number',
    driver_licence_no char(16) COMMENT 'Driver license number',
    department_id integer COMMENT 'Department ID',
    department_sysid integer COMMENT 'Department system ID',
    PRIMARY KEY (id),
    FOREIGN KEY (department_id, department_sysid) REFERENCES department (id, sysid)
) COMMENT 'Person';

ALTER TABLE person
    ADD UNIQUE (identity_card_no, driver_licence_no);

CREATE TABLE dog (
    id bigint NOT NULL COMMENT 'Dog ID',
    name varchar(32) NOT NULL COMMENT 'Dog name',
    owner bigint COMMENT 'Dog owner',
    chip_no char(128) NOT NULL COMMENT 'Chip number',
    PRIMARY KEY (id),
    FOREIGN KEY (owner) REFERENCES person (id)
) COMMENT 'Dog';
