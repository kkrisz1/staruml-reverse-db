-- Database: user
-- DROP TABLE person CASCADE;
-- DROP TABLE dog CASCADE;
-- DROP TABLE department CASCADE;
USE user;

CREATE TABLE department (
    id integer NOT NULL,
    sysid integer NOT NULL,
    name varchar(128) NOT NULL,
    PRIMARY KEY (id, sysid)
);

CREATE TABLE person (
    id bigint NOT NULL,
    name varchar(32) NOT NULL,
    age integer NOT NULL,
    identity_card_no char(16) NOT NULL,
    driver_licence_no char(16),
    department_id integer,
    department_sysid integer,
    PRIMARY KEY (id),
    FOREIGN KEY (department_id, department_sysid) REFERENCES department (id, sysid)
);

ALTER TABLE person
    ADD UNIQUE (identity_card_no, driver_licence_no);

CREATE TABLE dog (
    id bigint NOT NULL,
    name varchar(32) NOT NULL,
    owner bigint,
    chip_no char(128) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (owner) REFERENCES person (id)
);
