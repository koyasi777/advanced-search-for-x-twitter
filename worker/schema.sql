CREATE TABLE IF NOT EXISTS sync_store (
  id TEXT PRIMARY KEY,
  revision INTEGER DEFAULT 0,
  auth_hash TEXT,
  salt TEXT,
  server_salt TEXT,
  total_chunks INTEGER,
  updated_at INTEGER
);
CREATE TABLE IF NOT EXISTS sync_chunks (
  store_id TEXT,
  revision INTEGER,
  chunk_index INTEGER,
  data TEXT,
  PRIMARY KEY (store_id, revision, chunk_index)
);
CREATE INDEX IF NOT EXISTS idx_chunks_gc ON sync_chunks (store_id, revision);
