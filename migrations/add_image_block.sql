-- Adiciona o tipo 'image' ao CHECK constraint da tabela blocks.
-- Execute no SQL Editor do Supabase.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_type = 'CHECK'
    AND table_name = 'blocks'
    AND constraint_name LIKE '%type%'
  ) THEN
    EXECUTE (
      SELECT 'ALTER TABLE blocks DROP CONSTRAINT ' || constraint_name
      FROM information_schema.table_constraints
      WHERE constraint_type = 'CHECK'
      AND table_name = 'blocks'
      AND constraint_name LIKE '%type%'
      LIMIT 1
    );
  END IF;
END$$;

-- Recria com todos os tipos válidos incluindo 'image'
ALTER TABLE blocks ADD CONSTRAINT blocks_type_check
  CHECK (type IN ('text', 'checklist', 'cards', 'table', 'crm_template', 'links', 'notepad', 'search', 'flow', 'image'));
