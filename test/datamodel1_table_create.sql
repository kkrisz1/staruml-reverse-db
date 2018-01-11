CREATE TABLE public.person (
    id bigint NOT NULL,
    name varchar(32) NOT NULL,
    age integer NOT NULL,
    identity_card_no char(16) NOT NULL,
    driver_licence_no char(16),
    PRIMARY KEY (id)
);

ALTER TABLE public.person
    ADD UNIQUE (identity_card_no, driver_licence_no);


CREATE TABLE public.dog (
    id bigint NOT NULL,
    name varchar(32) NOT NULL,
    owner bigint,
    chip_no char(128) NOT NULL,
    PRIMARY KEY (id)
);

CREATE INDEX ON public.dog
    (owner);


ALTER TABLE public.dog ADD CONSTRAINT FK_dog__owner FOREIGN KEY (owner) REFERENCES public.person(id);