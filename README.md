# phoenix-ejabberd-jwt
A sample showing Phoenix registration/auth against Postgres along with eJabbred reg/auth via a JWT.

You should follow https://github.com/ParamountVentures/ejabberd-auth-jwt to prepare the JWT side.

1. Install eJabberd. 
2. Install Postgres and create a users table as below.

```
-- Sequence: public.users_id_seq

-- DROP SEQUENCE public.users_id_seq;

CREATE SEQUENCE public.users_id_seq
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 4
  CACHE 1;
ALTER TABLE public.users_id_seq
  OWNER TO postgres;

-- Table: public.users

-- DROP TABLE public.users;

CREATE TABLE public.users
(
  id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
  email character varying(255),
  crypted_password character varying(255),
  inserted_at timestamp without time zone NOT NULL,
  updated_at timestamp without time zone NOT NULL,
  CONSTRAINT users_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.users
  OWNER TO postgres;
```
3. Configure the Postgres details in dev.exs and run this app mix phoenix.server
4. Open two browsers and register a couple of users.
5. Enter the username of one user, type and message and send to view instant chat.
