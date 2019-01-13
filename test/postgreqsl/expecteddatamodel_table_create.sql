-- Database: user
-- DROP TABLE public.person CASCADE;
-- DROP TABLE public.dog CASCADE;
-- DROP TABLE public.department CASCADE;

CREATE TABLE public.department (
    id integer NOT NULL,
    sysid integer NOT NULL,
    name varchar(128) NOT NULL,
    PRIMARY KEY (id, sysid)
);

COMMENT ON TABLE public.department IS 'Department';
COMMENT ON COLUMN public.department.id IS 'Department ID';
COMMENT ON COLUMN public.department.sysid IS 'Department system ID';
COMMENT ON COLUMN public.department.name IS 'Department name';

CREATE TABLE public.person (
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

COMMENT ON TABLE public.person IS 'Person';
COMMENT ON COLUMN public.person.id IS 'Person ID';
COMMENT ON COLUMN public.person.name IS 'Person name';
COMMENT ON COLUMN public.person.age IS 'Person age';
COMMENT ON COLUMN public.person.identity_card_no IS 'National identity card number';
COMMENT ON COLUMN public.person.driver_licence_no IS 'Driver license number';
COMMENT ON COLUMN public.person.department_id IS 'Department ID';
COMMENT ON COLUMN public.person.department_sysid IS 'Department system ID';

ALTER TABLE public.person
    ADD UNIQUE (identity_card_no, driver_licence_no);

CREATE TABLE public.dog (
    id bigint NOT NULL,
    name varchar(32) NOT NULL,
    owner bigint,
    chip_no char(128) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (owner) REFERENCES person (id)
);

COMMENT ON TABLE public.dog IS 'Dog';
COMMENT ON COLUMN public.dog.id IS 'Dog ID';
COMMENT ON COLUMN public.dog.name IS 'Dog name';
COMMENT ON COLUMN public.dog.owner IS 'Dog owner';
COMMENT ON COLUMN public.dog.chip_no IS 'Chip number';
