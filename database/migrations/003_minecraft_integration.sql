CREATE TABLE IF NOT EXISTS minecraft_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    minecraft_uuid VARCHAR(36) UNIQUE,
    minecraft_username VARCHAR(16) UNIQUE NOT NULL,
    is_premium BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_ip INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS minecraft_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES minecraft_accounts(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS minecraft_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES minecraft_accounts(id) ON DELETE CASCADE,
    play_time BIGINT DEFAULT 0,
    blocks_broken BIGINT DEFAULT 0,
    blocks_placed BIGINT DEFAULT 0,
    deaths INTEGER DEFAULT 0,
    mobs_killed INTEGER DEFAULT 0,
    distance_traveled DOUBLE PRECISION DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS minecraft_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES minecraft_accounts(id) ON DELETE CASCADE,
    permission_node VARCHAR(255) NOT NULL,
    value BOOLEAN DEFAULT true,
    world VARCHAR(255),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(account_id, permission_node, world)
);