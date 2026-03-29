-- Adiciona colunas de navegação lateral na tabela sections
-- Execute no SQL Editor do Supabase

ALTER TABLE sections ADD COLUMN IF NOT EXISTS show_sidebar boolean DEFAULT false;
ALTER TABLE sections ADD COLUMN IF NOT EXISTS sidebar_position text DEFAULT 'left';
