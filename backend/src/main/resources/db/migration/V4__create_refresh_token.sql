CREATE TABLE refresh_token (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash varchar(64) NOT NULL UNIQUE,
    expires_at timestamptz NOT NULL,
    revoked_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT chk_refresh_token_expiry CHECK (expires_at > created_at)
);

CREATE INDEX idx_refresh_token_user_id
    ON refresh_token(user_id);

CREATE INDEX idx_refresh_token_expires_at
    ON refresh_token(expires_at);

CREATE INDEX idx_refresh_token_revoked_at
    ON refresh_token(revoked_at);