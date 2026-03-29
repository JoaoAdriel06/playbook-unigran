-- Adiciona opção de fixar sidebar no topo da página
ALTER TABLE sections ADD COLUMN IF NOT EXISTS sidebar_sticky boolean DEFAULT false;
