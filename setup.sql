-- =========================================
-- UNIGRAN SISTEMA - SETUP DO BANCO DE DADOS
-- Execute isso no SQL Editor do Supabase
-- =========================================

-- 1. Seções (abas de navegação)
CREATE TABLE IF NOT EXISTS sections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  emoji text DEFAULT '',
  slug text UNIQUE NOT NULL,
  order_index integer DEFAULT 0,
  visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 2. Blocos de conteúdo dentro de cada seção
CREATE TABLE IF NOT EXISTS blocks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id uuid REFERENCES sections(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('text', 'checklist', 'cards', 'table', 'crm_template', 'links', 'notepad')),
  title text,
  content jsonb NOT NULL DEFAULT '{}',
  order_index integer DEFAULT 0,
  visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 3. Configurações do sistema (incluindo senha admin)
CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value text NOT NULL
);

-- Senha admin padrão (MUDE DEPOIS!)
INSERT INTO settings (key, value) VALUES ('admin_password', 'unigran2026')
ON CONFLICT (key) DO NOTHING;

-- =========================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- =========================================
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Leitura pública (equipe ver o site)
CREATE POLICY "Read sections" ON sections FOR SELECT USING (true);
CREATE POLICY "Read blocks" ON blocks FOR SELECT USING (true);
CREATE POLICY "Read settings" ON settings FOR SELECT USING (true);

-- Escrita pública (admin via anon key - ferramenta interna)
CREATE POLICY "Write sections" ON sections FOR ALL USING (true);
CREATE POLICY "Write blocks" ON blocks FOR ALL USING (true);
CREATE POLICY "Write settings" ON settings FOR ALL USING (true);
