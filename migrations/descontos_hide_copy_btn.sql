-- Desativa o botão de copiar em todos os blocos de texto da seção Descontos & Regras 2026
-- Execute no Supabase SQL Editor

UPDATE blocks
SET content = content || '{"show_copy_btn": false}'::jsonb
WHERE section_id = (SELECT id FROM sections WHERE slug = 'descontos-regras-2026')
  AND type = 'text';
