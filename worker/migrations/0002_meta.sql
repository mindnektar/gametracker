-- Not part of the old schema: application state. data_version goes up with every change, so
-- cached API responses from before a change are never served again (see src/cache.js).
CREATE TABLE meta (
    key TEXT PRIMARY KEY NOT NULL,
    value INTEGER NOT NULL
);

INSERT INTO meta (key, value) VALUES ('data_version', 1);
