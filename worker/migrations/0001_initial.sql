-- The schema of the Postgres database on Heroku as of October 2026, translated to SQLite:
-- uuid, varchar and timestamptz columns become TEXT (timestamps are ISO 8601 strings), real
-- becomes REAL and integer/smallint become INTEGER. Foreign keys cascade on delete like before.

CREATE TABLE system (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    company TEXT
);

CREATE TABLE developer (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE compilation (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE genre (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE franchise (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE game (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    rating INTEGER NOT NULL,
    release INTEGER NOT NULL,
    description TEXT NOT NULL,
    you_tube_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    system_id TEXT NOT NULL REFERENCES system (id) ON DELETE CASCADE,
    developer_id TEXT NOT NULL REFERENCES developer (id) ON DELETE CASCADE,
    compilation_id TEXT REFERENCES compilation (id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'completed',
    skip_count INTEGER NOT NULL DEFAULT 0,
    time_to_beat REAL,
    critic_rating INTEGER,
    country TEXT,
    completed_at TEXT,
    atmosphere INTEGER,
    mood INTEGER,
    pacing INTEGER,
    complexity INTEGER,
    player_agency INTEGER,
    narrative_structure INTEGER,
    challenge_focus INTEGER,
    challenge_intensity INTEGER
);

CREATE TABLE dlc (
    id TEXT PRIMARY KEY NOT NULL,
    game_id TEXT NOT NULL REFERENCES game (id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    rating INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    release INTEGER,
    description TEXT,
    you_tube_id TEXT,
    critic_rating INTEGER,
    time_to_beat REAL
);

CREATE TABLE genre_game_xref (
    genre_id TEXT NOT NULL REFERENCES genre (id) ON DELETE CASCADE,
    game_id TEXT NOT NULL REFERENCES game (id) ON DELETE CASCADE,
    PRIMARY KEY (genre_id, game_id)
);

CREATE TABLE game_franchise_xref (
    game_id TEXT NOT NULL REFERENCES game (id) ON DELETE CASCADE,
    franchise_id TEXT NOT NULL REFERENCES franchise (id) ON DELETE CASCADE,
    PRIMARY KEY (game_id, franchise_id)
);

-- SQLite doesn't index foreign keys by itself; these keep cascading deletes and lookups fast
CREATE INDEX game_system_id_index ON game (system_id);
CREATE INDEX game_developer_id_index ON game (developer_id);
CREATE INDEX game_compilation_id_index ON game (compilation_id);
CREATE INDEX dlc_game_id_index ON dlc (game_id);
CREATE INDEX genre_game_xref_game_id_index ON genre_game_xref (game_id);
CREATE INDEX game_franchise_xref_franchise_id_index ON game_franchise_xref (franchise_id);
