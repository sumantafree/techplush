-- ============================================================
-- NextAuth Supabase Adapter — required tables
-- Run this in Supabase SQL Editor (separate from schema.sql)
-- Then: Supabase Dashboard → Settings → API → "Exposed schemas"
--       → add `next_auth` to the list and Save.
-- ============================================================

CREATE SCHEMA IF NOT EXISTS next_auth;
GRANT USAGE ON SCHEMA next_auth TO service_role;
GRANT ALL ON SCHEMA next_auth TO postgres;

CREATE TABLE IF NOT EXISTS next_auth.users (
  id            uuid NOT NULL DEFAULT uuid_generate_v4(),
  name          text,
  email         text,
  "emailVerified" timestamp with time zone,
  image         text,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT email_unique UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS next_auth.sessions (
  id             uuid NOT NULL DEFAULT uuid_generate_v4(),
  expires        timestamp with time zone NOT NULL,
  "sessionToken" text NOT NULL,
  "userId"       uuid,
  CONSTRAINT sessions_pkey PRIMARY KEY (id),
  CONSTRAINT "sessionToken_unique" UNIQUE ("sessionToken"),
  CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES next_auth.users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS next_auth.accounts (
  id                  uuid NOT NULL DEFAULT uuid_generate_v4(),
  type                text NOT NULL,
  provider            text NOT NULL,
  "providerAccountId" text NOT NULL,
  refresh_token       text,
  access_token        text,
  expires_at          bigint,
  token_type          text,
  scope               text,
  id_token            text,
  session_state       text,
  oauth_token_secret  text,
  oauth_token         text,
  "userId"            uuid,
  CONSTRAINT accounts_pkey PRIMARY KEY (id),
  CONSTRAINT provider_unique UNIQUE (provider, "providerAccountId"),
  CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES next_auth.users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS next_auth.verification_tokens (
  identifier text,
  token      text,
  expires    timestamp with time zone NOT NULL,
  CONSTRAINT verification_tokens_pkey PRIMARY KEY (token),
  CONSTRAINT token_unique UNIQUE (token),
  CONSTRAINT token_identifier_unique UNIQUE (token, identifier)
);

GRANT ALL ON ALL TABLES IN SCHEMA next_auth TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA next_auth TO service_role;
