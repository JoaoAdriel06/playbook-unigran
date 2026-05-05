-- migrations/descontos_regras_2026.sql
-- Cria a seção "Descontos & Regras 2026" logo após a aba de Investimentos,
-- com sidebar sticky no topo (modo abas) e barra de busca integrada.
-- Execute no Supabase SQL Editor.

-- 1. Abre espaço na ordem: empurra tudo que vem depois de investimentos
UPDATE sections
SET order_index = order_index + 1
WHERE order_index > (SELECT order_index FROM sections WHERE slug = 'investimentos');

-- 2. Cria a nova seção
INSERT INTO sections (title, emoji, slug, order_index, visible, show_sidebar, sidebar_position, sidebar_sticky, access)
SELECT
  'Descontos & Regras 2026',
  '💰',
  'descontos-regras-2026',
  (SELECT order_index + 1 FROM sections WHERE slug = 'investimentos'),
  true, true, 'top', true, 'all';

-- 3. Insere os blocos
DO $$
DECLARE
  sec_id uuid;
BEGIN
  SELECT id INTO sec_id FROM sections WHERE slug = 'descontos-regras-2026';

  -- ── Busca (sticky, aparece fixada acima das abas) ──────────────────────────
  INSERT INTO blocks (section_id, type, title, content, order_index, visible) VALUES
  (sec_id, 'search', 'Busca',
    jsonb_build_object(
      'placeholder', 'Buscar desconto, convênio, curso, regra...',
      'sticky', true,
      'search_in', jsonb_build_array()
    ),
    0, true);

  -- ── 1. Convênios com Empresas ──────────────────────────────────────────────
  INSERT INTO blocks (section_id, type, title, content, order_index, visible) VALUES
  (sec_id, 'text', '🤝 Convênios com Empresas',
    jsonb_build_object(
      'isHtml', true,
      'body',
      '<h2>Desconto: 25% a 30%</h2>'
      '<p>Aplicado sobre o valor da mensalidade conforme convênio cadastrado no sistema.</p>'
      '<hr>'
      '<h3>Válido para</h3>'
      '<ul>'
        '<li>Cursos <strong>presenciais</strong></li>'
        '<li><strong>Pós-graduação</strong> presencial</li>'
      '</ul>'
      '<hr>'
      '<h3>Exceção</h3>'
      '<p><mark>Odontologia</mark> não participa deste benefício.</p>'
    ),
    1, true);

  -- ── 2. Egresso UNIGRAN (Presencial) ───────────────────────────────────────
  INSERT INTO blocks (section_id, type, title, content, order_index, visible) VALUES
  (sec_id, 'text', '🎓 Egresso UNIGRAN',
    jsonb_build_object(
      'isHtml', true,
      'body',
      '<h2>Desconto: 50%</h2>'
      '<p>Para egressos da UNIGRAN que desejam cursar uma <strong>nova graduação presencial</strong>.</p>'
      '<hr>'
      '<h3>Exceção</h3>'
      '<p><mark>Odontologia</mark> não participa deste benefício.</p>'
      '<hr>'
      '<h3>Regras adicionais</h3>'
      '<ul>'
        '<li><strong>Educação Física</strong> (Licenciatura → Bacharelado): mantém o desconto de 50%</li>'
        '<li>Aluno com <strong>mais de um curso presencial</strong>: desconto aplicado no curso de <strong>maior valor</strong></li>'
      '</ul>'
    ),
    2, true);

  -- ── 3. Integração Presencial ↔ EAD/Semi ───────────────────────────────────
  INSERT INTO blocks (section_id, type, title, content, order_index, visible) VALUES
  (sec_id, 'text', '🔄 Integração EAD ↔ Presencial',
    jsonb_build_object(
      'isHtml', true,
      'body',
      '<h2>EAD/Semi → Presencial</h2>'
      '<h3>Desconto: 50%</h3>'
      '<ul>'
        '<li>Alunos <strong>ativos ou formados</strong> no EAD/Semi</li>'
        '<li>Apenas <strong>Polo 1</strong> (Modelo) e <strong>Polo 3</strong> (Centro) de Dourados</li>'
      '</ul>'
      '<p><mark>Odontologia</mark> não participa.</p>'
      '<hr>'
      '<h2>Presencial → EAD/Semi</h2>'
      '<h3>Desconto: 30%</h3>'
      '<ul>'
        '<li>⚠ <strong>Encaminhar para Tesouraria EAD</strong></li>'
        '<li>⚠ <strong>Não informar o percentual ao aluno</strong></li>'
      '</ul>'
      '<hr>'
      '<h2>Pós-graduação Presencial</h2>'
      '<h3>Desconto: 30%</h3>'
      '<p>Válido para formados no presencial <strong>ou</strong> no EAD.</p>'
    ),
    3, true);

  -- ── 4. Capital → Dourados ──────────────────────────────────────────────────
  INSERT INTO blocks (section_id, type, title, content, order_index, visible) VALUES
  (sec_id, 'text', '🏙️ Capital → Dourados',
    jsonb_build_object(
      'isHtml', true,
      'body',
      '<h2>Egresso da Capital</h2>'
      '<h3>Desconto: 50%</h3>'
      '<p>Válido para <strong>nova graduação em Dourados</strong>.</p>'
      '<p><mark>Odontologia</mark> não participa.</p>'
      '<hr>'
      '<h2>Transferência Capital → Dourados</h2>'
      '<p>O aluno <strong>mantém o desconto já ofertado na Capital</strong>.</p>'
      '<hr>'
      '<h3>Exceções à transferência de desconto</h3>'
      '<ul>'
        '<li>Planos governamentais</li>'
        '<li>Convênios não participantes em Dourados</li>'
      '</ul>'
    ),
    4, true);

  -- ── 5. Estagiários UNIGRAN ─────────────────────────────────────────────────
  INSERT INTO blocks (section_id, type, title, content, order_index, visible) VALUES
  (sec_id, 'text', '🧩 Estagiários UNIGRAN',
    jsonb_build_object(
      'isHtml', true,
      'body',
      '<h2>Regras específicas</h2>'
      '<ul>'
        '<li>Estagiários <strong>não possuem desconto de ônibus</strong> — recebem <strong>auxílio transporte</strong></li>'
        '<li>O estágio <strong>cobre adaptações</strong></li>'
        '<li>O estágio <strong>não cobre DP</strong> (Dependência)</li>'
      '</ul>'
    ),
    5, true);

  -- ── 6. Técnico em Enfermagem → Enfermagem ─────────────────────────────────
  INSERT INTO blocks (section_id, type, title, content, order_index, visible) VALUES
  (sec_id, 'text', '🏥 Téc. Enfermagem → Enfermagem',
    jsonb_build_object(
      'isHtml', true,
      'body',
      '<h2>Desconto: 50%</h2>'
      '<p>Válido para <strong>calouros com certificado técnico em enfermagem</strong>.</p>'
      '<hr>'
      '<h3>Aplicação</h3>'
      '<ul>'
        '<li>Na <strong>matrícula</strong></li>'
        '<li>Nas <strong>mensalidades durante todo o curso</strong></li>'
      '</ul>'
      '<hr>'
      '<p>Necessário apresentar o <strong>certificado técnico</strong> no ato da matrícula.</p>'
    ),
    6, true);

  -- ── 7. ENEM 2026.2 — Regras ───────────────────────────────────────────────
  INSERT INTO blocks (section_id, type, title, content, order_index, visible) VALUES
  (sec_id, 'text', '📝 ENEM 2026.2',
    jsonb_build_object(
      'isHtml', true,
      'body',
      '<h2>Como funciona</h2>'
      '<p>O desconto é aplicado <strong>somente na matrícula</strong>, calculado pela média das 5 notas do ENEM.</p>'
      '<hr>'
      '<h3>Regras básicas</h3>'
      '<ul>'
        '<li>Válido para notas do ENEM a partir de <strong>2014</strong></li>'
        '<li><strong>Não pode ter zerado</strong> nenhuma área</li>'
        '<li>Válido apenas para <strong>calouros</strong></li>'
        '<li>Válido para apenas <strong>1 curso</strong></li>'
        '<li><strong>Não cumulativo</strong> com outros descontos</li>'
      '</ul>'
      '<hr>'
      '<h3>Cálculo da média</h3>'
      '<p><strong>Soma das 5 notas ÷ 5</strong></p>'
      '<hr>'
      '<h3>Documentos necessários</h3>'
      '<ul>'
        '<li>Boletim do ENEM</li>'
        '<li>Documentação completa de matrícula</li>'
      '</ul>'
      '<hr>'
      '<p>⚠ O desconto só é garantido se a matrícula for feita <strong>dentro do prazo da campanha</strong>.</p>'
    ),
    7, true);

  -- ── 8. Tabela de Descontos ENEM ───────────────────────────────────────────
  INSERT INTO blocks (section_id, type, title, content, order_index, visible) VALUES
  (sec_id, 'table', '📊 Tabela ENEM — Desconto por Média',
    jsonb_build_object(
      'subtitle', 'Desconto aplicado somente na matrícula, conforme média das 5 notas.',
      'searchable', false,
      'headers', jsonb_build_array('Modalidade', 'Média ENEM', 'Desconto na Matrícula'),
      'rows', jsonb_build_array(
        jsonb_build_array('Presencial (exceto Odontologia)', '450 a 799', '30%'),
        jsonb_build_array('Presencial (exceto Odontologia)', '800 a 1000', '50%'),
        jsonb_build_array('Odontologia', '500 a 1000', '35%')
      ),
      'column_types', jsonb_build_array('text', 'text', 'text')
    ),
    8, true);

  -- ── 9. Descontos Especiais por Curso ──────────────────────────────────────
  INSERT INTO blocks (section_id, type, title, content, order_index, visible) VALUES
  (sec_id, 'table', '🎯 Cursos com Desconto Especial',
    jsonb_build_object(
      'subtitle', 'Descontos especiais vigentes para matrículas 2026.',
      'searchable', true,
      'headers', jsonb_build_array('Curso', 'Valor Original', 'Valor Final', 'Desconto', 'Aplicação'),
      'rows', jsonb_build_array(
        jsonb_build_array('Nutrição',          'R$ 1.616,00', 'R$ 869,00', '50%', 'Matrícula + Mensalidades'),
        jsonb_build_array('Radiologia',         'R$ 952,00',  'R$ 476,00', '50%', 'Matrícula + Mensalidades'),
        jsonb_build_array('Administração',      '—',          'R$ 827,00', '30%', 'Curso todo'),
        jsonb_build_array('Ciências Contábeis', '—',          'R$ 827,00', '30%', 'Curso todo'),
        jsonb_build_array('Educação Física',    'Mensalidade','—',         'Até 50%', 'Matrícula'),
        jsonb_build_array('Arquitetura',        'Mensalidade','—',         'Até 50%', 'Matrícula'),
        jsonb_build_array('Fisioterapia',       'Mensalidade','—',         'Até 50%', 'Matrícula'),
        jsonb_build_array('Produção Agrícola',  'Mensalidade','—',         'Até 50%', 'Matrícula')
      ),
      'column_types', jsonb_build_array('text', 'text', 'text', 'text', 'text')
    ),
    9, true);

  -- ── 10. Aluno Indígena ────────────────────────────────────────────────────
  INSERT INTO blocks (section_id, type, title, content, order_index, visible) VALUES
  (sec_id, 'text', '🌎 Aluno Indígena',
    jsonb_build_object(
      'isHtml', true,
      'body',
      '<h2>Desconto: 50%</h2>'
      '<p>Aplicado na <strong>matrícula</strong> e nas <strong>mensalidades</strong> durante todo o curso.</p>'
      '<hr>'
      '<h3>Válido para</h3>'
      '<p>Todos os cursos, <mark>exceto Odontologia</mark>.</p>'
      '<hr>'
      '<h3>Documentação necessária</h3>'
      '<p>Apresentar <strong>documento comprobatório de etnia</strong> no ato da matrícula.</p>'
    ),
    10, true);

END $$;
