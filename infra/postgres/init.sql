-- ============================================================
-- IMPÉRIO ERP — PostgreSQL Initialization Script
-- Creates extensions needed for the application
-- ============================================================

-- UUID generation support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Full-text search with Portuguese
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- JSON indexing (GIN)
-- Already available in PostgreSQL by default

-- Performance: pg_trgm for LIKE queries
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Vector similarity search (future AI features)
-- CREATE EXTENSION IF NOT EXISTS "vector";

COMMIT;
