CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

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
	label VARCHAR(100) NOT NULL,
	value VARCHAR(100) NOT NULL,
	description TEXT,
	parent_id UUID DEFAULT NULL REFERENCES types(id) ON DELETE RESTRICT,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW(),
	UNIQUE(parent_id, label),
	UNIQUE(parent_id, value)
);

-- CREDENTIALS TABLE
CREATE TABLE IF NOT EXISTS credentials(
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	title TEXT NOT NULL,
	short_description TEXT NULL,
	long_description TEXT NULL,
	thumbnail_url TEXT NULL,
	thumbnail_format VARCHAR(10) NULL,
	thumbnail_width INT NULL,
	thumbnail_height INT NULL,
	version INT DEFAULT 0,
	data TEXT NOT NULL,
	notes TEXT NULL,
	tags TEXT NULL,
	is_draft BOOLEAN DEFAULT FALSE,
	is_favourite BOOLEAN DEFAULT FALSE,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW(),
	user_id UUID NULL,
	types_id UUID NULL,
	CONSTRAINT credentials_user_id_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL ON UPDATE SET NULL,
	CONSTRAINT credentials_types_id_fk FOREIGN KEY (types_id) REFERENCES types (id) ON DELETE SET NULL ON UPDATE SET NULL
);

CREATE TABLE IF NOT EXISTS credential_images(
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	image_url TEXT NULL,
	format VARCHAR(10) NULL,
	width INT NULL,
	height INT NULL,
	byte_size INT NULL,
	sort_order INT DEFAULT 0,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW(),
	credential_id UUID NOT NULL,
	CONSTRAINT credential_images_credential_id_fk FOREIGN KEY (credential_id) REFERENCES credentials (id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- INDEXES
CREATE UNIQUE INDEX IF NOT EXISTS users_username_idx ON users(username);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON users(email);


CREATE INDEX IF NOT EXISTS credentials_title_idx ON credentials (title);
CREATE INDEX IF NOT EXISTS credentials_short_description_idx ON credentials (short_description);
CREATE INDEX IF NOT EXISTS credentials_long_description_idx ON credentials (long_description);
CREATE INDEX IF NOT EXISTS credentials_data_idx ON credentials USING GIN (data gin_trgm_ops);
CREATE INDEX IF NOT EXISTS credentials_notes_idx ON credentials (notes);
CREATE INDEX IF NOT EXISTS credentials_created_at_idx ON credentials(created_at);
CREATE INDEX IF NOT EXISTS credentials_user_id_idx ON credentials(user_id);
CREATE INDEX IF NOT EXISTS credentials_types_id_idx ON credentials(types_id);

CREATE INDEX IF NOT EXISTS types_parent_id_idx ON types(parent_id);
CREATE INDEX IF NOT EXISTS types_parent_id_value_idx ON types(parent_id, value);
CREATE INDEX IF NOT EXISTS types_parent_id_label_idx ON types(parent_id, label);
CREATE INDEX IF NOT EXISTS credentials_created_at_id_idx ON credentials(created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS credential_images_credential_id_idx ON credential_images(credential_id);


CREATE INDEX IF NOT EXISTS session_user_id_idx ON session(user_id);
CREATE INDEX IF NOT EXISTS session_token_idx ON session(token);
CREATE INDEX IF NOT EXISTS session_expires_at_idx ON session(expires_at);


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
