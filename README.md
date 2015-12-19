# phoenix-ejabberd-jwt
A sample showing Phoenix registration/auth against Postgres along with eJabbred reg/auth via a JWT.

1. Install eJabberd. 
2. Install Postgres and create a users table as below.

```
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