CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USER TABLE
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

-- SESSION TABLE
CREATE TABLE IF NOT EXISTS session(
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	token VARCHAR(255) UNIQUE NOT NULL,
	expires_at TIMESTAMPTZ NOT NULL,
	created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TYPES TABLE
CREATE TABLE IF NOT EXISTS types(
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	label VARCHAR(100) UNIQUE NOT NULL,
	description TEXT,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CREDENTIALS TABLE
CREATE TABLE IF NOT EXISTS credentials(
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	title TEXT NOT NULL,
	short_description TEXT NULL,
	long_description TEXT NULL,
	thumbnail BYTEA NULL,
	data JSONB NOT NULL,
	images JSONB NULL,
	notes TEXT NULL,
	tags JSONB NULL,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW(),
	user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	types_id UUID NOT NULL REFERENCES types(id) ON DELETE SET NULL
);

-- INDEXES
CREATE INDEX idx_user_username ON users(username);
CREATE INDEX idx_user_email ON users(email);

CREATE INDEX idx_credentials_userId ON credentials(user_id);
CREATE INDEX idx_types_typesId ON credentials(types_id);

CREATE INDEX idx_session_userId ON session(user_id);
CREATE INDEX idx_session_token ON session(token);
CREATE INDEX idx_session_expiresAt ON session(expires_at);


-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Triggers for types table
CREATE TRIGGER update_types_updated_at
    BEFORE UPDATE ON types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Triggers for credentials table
CREATE TRIGGER update_credentials_updated_at
    BEFORE UPDATE ON credentials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
