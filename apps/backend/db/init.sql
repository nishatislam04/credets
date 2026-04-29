CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum type for credentials
DO $$ BEGIN
    CREATE TYPE credential_type AS ENUM ('credentials', 'key', 'api', 'media', 'game_loadout', 'misc');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


CREATE TABLE IF NOT EXISTS users(
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	name VARCHAR(50),
	username VARCHAR(50) UNIQUE NOT NULL,
	email VARCHAR(200) UNIQUE NOT NULL,
	password text NOT NULL,
	special_password text NOT NULL,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS session(
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	token VARCHAR(255) UNIQUE NOT NULL,
	expires_at TIMESTAMPTZ NOT NULL,
	created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS credentials(
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	type credential_type NOT NULL,
	data JSONB NOT NULL,
	images JSONB,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_username ON users(username);
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_credentials_userId ON credentials(user_id);
CREATE INDEX idx_session_userId ON session(user_id);
CREATE INDEX idx_session_token ON session(token);
CREATE INDEX idx_session_expiresAt ON session(expires_at);
