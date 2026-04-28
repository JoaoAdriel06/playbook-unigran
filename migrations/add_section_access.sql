-- Add access control column to sections
ALTER TABLE sections ADD COLUMN IF NOT EXISTS access text DEFAULT 'all'
  CHECK (access IN ('all', 'user', 'gestor'));
