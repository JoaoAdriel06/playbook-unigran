-- =========================================
-- UNIGRAN SISTEMA - DADOS INICIAIS
-- Execute DEPOIS do setup.sql
-- =========================================

-- SEÇÕES (abas de navegação)
INSERT INTO sections (title, emoji, slug, order_index, visible) VALUES
  ('Início',               '🏠', 'inicio',              1,  true),
  ('Checklist Diário',     '✅', 'checklist-diario',    2,  true),
  ('CRM',                  '📊', 'crm',                 3,  true),
  ('Investimentos',        '💰', 'investimentos',       4,  true),
  ('Formas de Ingresso',   '🎯', 'formas-de-ingresso',  5,  true),
  ('Diferenciais',         '🚀', 'diferenciais',        6,  true),
  ('Informações Extras',   '💡', 'informacoes-extras',  7,  true),
  ('Unigran Academy',      '🎓', 'unigran-academy',     8,  true),
  ('Pergunte para a Uni',  '🤖', 'pergunte-para-a-uni', 9,  true);

-- =========================================
-- BLOCOS - INÍCIO
-- =========================================
INSERT INTO blocks (section_id, type, title, content, order_index) VALUES
(
  (SELECT id FROM sections WHERE slug = 'inicio'),
  'links',
  'Documentos Importantes & Links Úteis',
  '{
    "items": [
      {"emoji": "🎥", "title": "Histórias que Inspiram & Por Dentro do Curso", "description": "Vídeos para apresentar a vivência do curso e trajetórias de sucesso ao candidato.", "url": "https://drive.google.com/drive/folders/1jSmnk1Kr75ZuAC1XRYcGUJ98mNq5acYm"},
      {"emoji": "📚", "title": "E-books dos Cursos", "description": "Materiais resumidos para reforçar os diferenciais de cada curso durante o atendimento.", "url": "https://drive.google.com/drive/folders/1Bn4e0vjoc3VHvrRYQnKJTpFhY6NqQstw"},
      {"emoji": "🗺️", "title": "Guia Universitário – Vida em Dourados", "description": "Guia para candidatos de outras cidades com informações sobre custo de vida, aluguel e lazer.", "url": "https://drive.google.com/file/d/1MEYHY29HTuWXzhuprfTqtAWVKpBaAnn7"},
      {"emoji": "🎬", "title": "Vídeos Institucionais", "description": "Conteúdos institucionais oficiais da UNIGRAN para uso no atendimento.", "url": "https://drive.google.com/drive/u/1/folders/1QmNFb9lYLOixF7D0OO6DE1YOLQSmi55g"},
      {"emoji": "🤝", "title": "Convênios Ativos", "description": "Lista atualizada de convênios e descontos disponíveis.", "url": "https://docs.google.com/document/u/1/d/1k6YpHP0Ctv8Qr1zKjOIf-NcAk4-DJm0v"},
      {"emoji": "🆘", "title": "Help da Equipe Comercial", "description": "Documento com orientações e procedimentos internos relevantes.", "url": "https://docs.google.com/document/u/1/d/1So44NF-frw6N1rW5eVGn7UqAta3MFxwhYHQhZqQ2bZo"}
    ]
  }',
  1
);

-- =========================================
-- BLOCOS - CHECKLIST DIÁRIO
-- =========================================
INSERT INTO blocks (section_id, type, title, content, order_index) VALUES
(
  (SELECT id FROM sections WHERE slug = 'checklist-diario'),
  'checklist',
  'Preparação Diária Completa',
  '{
    "subtitle": "\"Antes de atender alguém, esteja pronto para atender bem.\"",
    "groups": [
      {
        "title": "1. Estrutura Digital",
        "tip": "Essas abas devem iniciar automaticamente com o navegador — configure como páginas iniciais.",
        "items": [
          {"id": "wpp", "label": "WhatsApp Web"},
          {"id": "rd-conv", "label": "RD Conversas"},
          {"id": "crm", "label": "CRM RD Station"},
          {"id": "sgi", "label": "SGI"},
          {"id": "sga", "label": "SGA (Fila Totem)"},
          {"id": "help", "label": "Help Equipe Comercial"},
          {"id": "convenios", "label": "Lista de Convênios"},
          {"id": "email", "label": "E-mail"},
          {"id": "site", "label": "Site Unigran"}
        ]
      },
      {
        "title": "2. Ferramentas Externas",
        "items": [
          {"id": "voip", "label": "VoIP aberto e funcional (para ligações rápidas)"},
          {"id": "celular", "label": "Celular carregado e conectado à internet"},
          {"id": "ligacoes", "label": "Verificar se há ligações perdidas e retorná-las"}
        ]
      },
      {
        "title": "3. Materiais de Apoio",
        "items": [
          {"id": "planilha", "label": "Planilha de investimentos atualizada"},
          {"id": "docs-matricula", "label": "Lista de documentos para matrícula"},
          {"id": "ramais", "label": "Lista de Ramais"}
        ]
      },
      {
        "title": "4. Organização do Espaço",
        "items": [
          {"id": "mesa", "label": "Mesa limpa e organizada"},
          {"id": "agua", "label": "Garrafinha d água cheia"},
          {"id": "cadeira", "label": "Cadeira alinhada e ambiente pronto para receber o público"},
          {"id": "ruidos", "label": "Evitar ruídos e conversas paralelas"},
          {"id": "controle", "label": "Controle individual de matrículas sempre atualizado"}
        ]
      }
    ],
    "closing_tip": "Comece o dia preparado e lembre-se: \"É justo que muito custe o que muito vale\"."
  }',
  1
);

-- =========================================
-- BLOCOS - CRM
-- =========================================
INSERT INTO blocks (section_id, type, title, content, order_index) VALUES
(
  (SELECT id FROM sections WHERE slug = 'crm'),
  'crm_template',
  'Templates de Notas – RD Station CRM',
  '{
    "templates": [
      {
        "label": "📄 Nota Inicial",
        "text": "INSCRITO DIA [DATA]\nFORMA DE INGRESSO: [ENEM / VESTIBULAR / TRANSFERÊNCIA EXTERNA / PORTADOR DE DIPLOMA]\nCONTATO INICIADO PELO CANAL: [RD CONVERSAS / WHATSAPP / LIGAÇÃO]\n\nAGUARDANDO RESPOSTA"
      },
      {
        "label": "📈 Acompanhamento – 1º Follow",
        "text": "FOLLOW [DATA]\nCANAL: [CANAL]\nSTATUS: [SITUAÇÃO DO CANDIDATO]\nPRÓXIMA AÇÃO: [O QUE FOI COMBINADO]"
      },
      {
        "label": "✅ Matrícula Realizada",
        "text": "MATRÍCULA REALIZADA – [DATA]\nCURSO: [CURSO]\nFORMA DE INGRESSO: [FORMA]\nOBSERVAÇÕES: [OBS]"
      },
      {
        "label": "❌ Candidato Desistiu",
        "text": "DESISTÊNCIA – [DATA]\nMOTIVO: [MOTIVO INFORMADO]\nOBSERVAÇÕES: [OBS]"
      }
    ]
  }',
  1
);

-- =========================================
-- BLOCOS - INVESTIMENTOS
-- =========================================
INSERT INTO blocks (section_id, type, title, content, order_index) VALUES
(
  (SELECT id FROM sections WHERE slug = 'investimentos'),
  'table',
  '📄 Tabela Matrícula (Ciclo 2025)',
  '{
    "subtitle": "Valores do Ciclo 2025, usados como base para a Matrícula de novos alunos.",
    "searchable": true,
    "headers": ["Curso", "Duração", "Formação", "Turno", "Investimento", "Pontualidade (até dia 10)", "Desconto Especial"],
    "rows": [
      ["Odontologia", "10 sem.", "Bacharel", "Integral", "R$ 3.280,00", "R$ 3.018,00", "-"],
      ["Medicina Veterinária", "10 sem.", "Bacharel", "Integral", "R$ 2.368,00", "R$ 2.179,00", "-"],
      ["Arquitetura", "10 sem.", "Bacharel", "Noturno", "R$ 1.655,00", "R$ 1.523,00", "-"],
      ["Biomedicina", "10 sem.", "Bacharel", "Noturno", "R$ 1.655,00", "R$ 1.523,00", "-"],
      ["Enfermagem", "10 sem.", "Bacharel", "Noturno", "R$ 1.655,00", "R$ 1.523,00", "-"],
      ["Farmácia", "10 sem.", "Bacharel", "Noturno", "R$ 1.655,00", "R$ 1.523,00", "-"],
      ["Fisioterapia", "10 sem.", "Bacharel", "Noturno", "R$ 1.655,00", "R$ 1.523,00", "-"],
      ["Engenharia Civil", "10 sem.", "Bacharel", "Noturno", "R$ 1.655,00", "R$ 1.523,00", "-"],
      ["Nutrição", "8 sem.", "Bacharel", "Noturno", "R$ 1.655,00", "R$ 1.523,00", "50% → R$ 828,00"],
      ["Gastronomia", "4 sem.", "Tecnólogo", "Noturno", "R$ 1.655,00", "R$ 1.523,00", "40% → R$ 993,00"],
      ["Agronomia", "10 sem.", "Bacharel", "Noturno", "R$ 1.562,00", "R$ 1.437,00", "-"],
      ["Psicologia", "10 sem.", "Bacharel", "Noturno/Diurno", "R$ 1.554,00", "R$ 1.430,00", "-"],
      ["Direito", "10 sem.", "Bacharel", "Noturno/Diurno", "R$ 1.435,00", "R$ 1.320,00", "-"],
      ["Engenharia de Software", "8 sem.", "Bacharel", "Noturno", "R$ 1.309,00", "R$ 1.204,00", "-"],
      ["Administração", "8 sem.", "Bacharel", "Noturno", "R$ 1.126,00", "R$ 1.036,00", "30% → R$ 788,00"],
      ["Ciências Contábeis", "8 sem.", "Bacharel", "Noturno", "R$ 1.126,00", "R$ 1.036,00", "30% → R$ 788,00"],
      ["Educação Física", "8 sem.", "Bacharel/Licenciatura", "Noturno", "R$ 1.006,00", "R$ 926,00", "-"],
      ["Radiologia", "6 sem.", "Tecnólogo", "Noturno", "R$ 952,00", "R$ 885,00", "50% → R$ 476,00"],
      ["Estética e Cosmética", "4 sem.", "Tecnólogo", "Noturno", "R$ 907,00", "R$ 834,00", "-"],
      ["Produção Agrícola", "6 sem.", "Tecnólogo", "Noturno", "R$ 907,00", "R$ 834,00", "-"],
      ["Publicidade e Propaganda", "8 sem.", "Bacharel", "Noturno", "R$ 907,00", "R$ 834,00", "-"],
      ["Design de Interiores", "4 sem.", "Tecnólogo", "Noturno", "R$ 837,00", "R$ 778,00", "50% → R$ 419,00"]
    ]
  }',
  1
),
(
  (SELECT id FROM sections WHERE slug = 'investimentos'),
  'table',
  '💸 Tabela Mensalidade (Ciclo 2026)',
  '{
    "subtitle": "Valores do Ciclo 2026, usados para o cálculo das Mensalidades e DPs.",
    "searchable": true,
    "headers": ["Curso", "Duração", "Formação", "Turno", "Investimento", "Pontualidade (até dia 10)", "Desconto Especial", "DP"],
    "rows": [
      ["Odontologia", "10 sem.", "Bacharel", "Integral", "R$ 3.444,00", "R$ 3.203,00", "-", "R$ 310,00"],
      ["Medicina Veterinária", "10 sem.", "Bacharel", "Integral", "R$ 2.486,00", "R$ 2.312,00", "-", "R$ 224,00"],
      ["Arquitetura", "10 sem.", "Bacharel", "Noturno", "R$ 1.738,00", "R$ 1.616,00", "-", "R$ 156,00"],
      ["Biomedicina", "8 sem.", "Bacharel", "Noturno", "R$ 1.738,00", "R$ 1.616,00", "-", "R$ 156,00"],
      ["Enfermagem", "10 sem.", "Bacharel", "Noturno", "R$ 1.738,00", "R$ 1.616,00", "-", "R$ 156,00"],
      ["Farmácia", "10 sem.", "Bacharel", "Noturno", "R$ 1.738,00", "R$ 1.616,00", "-", "R$ 156,00"],
      ["Fisioterapia", "10 sem.", "Bacharel", "Noturno", "R$ 1.738,00", "R$ 1.616,00", "-", "R$ 156,00"],
      ["Engenharia Civil", "10 sem.", "Bacharel", "Noturno", "R$ 1.738,00", "R$ 1.616,00", "-", "R$ 156,00"],
      ["Nutrição", "8 sem.", "Bacharel", "Noturno", "R$ 1.738,00", "R$ 1.616,00", "50% → R$ 869,00", "R$ 156,00"],
      ["Gastronomia", "4 sem.", "Tecnólogo", "Noturno", "R$ 1.738,00", "R$ 1.616,00", "40% → R$ 1.043,00", "R$ 156,00"],
      ["Agronomia", "10 sem.", "Bacharel", "Noturno", "R$ 1.640,00", "R$ 1.525,00", "-", "R$ 148,00"],
      ["Psicologia", "10 sem.", "Bacharel", "Noturno/Diurno", "R$ 1.632,00", "R$ 1.518,00", "-", "R$ 147,00"],
      ["Direito", "10 sem.", "Bacharel", "Noturno/Diurno", "R$ 1.507,00", "R$ 1.402,00", "-", "R$ 136,00"],
      ["Engenharia de Software", "8 sem.", "Bacharel", "Noturno", "R$ 1.374,00", "R$ 1.278,00", "-", "R$ 124,00"],
      ["Administração", "8 sem.", "Bacharel", "Noturno", "R$ 1.182,00", "R$ 1.099,00", "30% → R$ 827,00", "R$ 106,00"],
      ["Ciências Contábeis", "8 sem.", "Bacharel", "Noturno", "R$ 1.182,00", "R$ 1.099,00", "30% → R$ 827,00", "R$ 106,00"],
      ["Educação Física", "8 sem.", "Bacharel/Licenciatura", "Noturno", "R$ 1.056,00", "R$ 982,00", "-", "R$ 75,00"],
      ["Radiologia", "6 sem.", "Tecnólogo", "Noturno", "R$ 952,00", "R$ 885,00", "50% → R$ 476,00", "R$ 86,00"],
      ["Estética e Cosmética", "4 sem.", "Tecnólogo", "Noturno", "R$ 952,00", "R$ 885,00", "-", "R$ 86,00"],
      ["Produção Agrícola", "6 sem.", "Tecnólogo", "Noturno", "R$ 952,00", "R$ 885,00", "-", "R$ 86,00"],
      ["Publicidade e Propaganda", "8 sem.", "Bacharel", "Noturno", "R$ 952,00", "R$ 885,00", "-", "R$ 86,00"],
      ["Design de Interiores", "4 sem.", "Tecnólogo", "Noturno", "R$ 837,00", "R$ 778,00", "50% → R$ 419,00", "R$ 75,00"]
    ]
  }',
  2
),
(
  (SELECT id FROM sections WHERE slug = 'investimentos'),
  'text',
  '🎓 Investimentos EAD/Semipresencial',
  '{"body": "Adicione aqui os valores EAD/Semi pelo painel admin."}',
  3
),
(
  (SELECT id FROM sections WHERE slug = 'investimentos'),
  'text',
  '🏙️ Investimentos Capital',
  '{"body": "Adicione aqui os valores do campus Capital pelo painel admin."}',
  4
);

-- Placeholder para seções sem conteúdo capturado
INSERT INTO blocks (section_id, type, title, content, order_index) VALUES
(
  (SELECT id FROM sections WHERE slug = 'formas-de-ingresso'),
  'text',
  '🎯 Guia de Formas de Ingresso',
  '{"body": "Adicione o guia completo de formas de ingresso pelo painel admin.\n\nVocê pode usar blocos de texto, checklists e cards para organizar o conteúdo."}',
  1
),
(
  (SELECT id FROM sections WHERE slug = 'diferenciais'),
  'text',
  '🚀 Diferenciais dos Cursos',
  '{"body": "Adicione os diferenciais de cada curso pelo painel admin."}',
  1
),
(
  (SELECT id FROM sections WHERE slug = 'informacoes-extras'),
  'text',
  '💡 Informações Extras',
  '{"body": "Adicione informações extras relevantes para a equipe pelo painel admin.\n\nEste é o espaço ideal para substituir o Google Docs do Help da equipe — cole o conteúdo completo aqui."}',
  1
),
(
  (SELECT id FROM sections WHERE slug = 'unigran-academy'),
  'text',
  '🎓 Unigran Academy',
  '{"body": "Adicione as informações da Unigran Academy pelo painel admin."}',
  1
),
(
  (SELECT id FROM sections WHERE slug = 'pergunte-para-a-uni'),
  'text',
  '🤖 Pergunte para a Uni',
  '{"body": "Esta seção pode ser configurada com o chatbot de IA.\n\nPelo painel admin, você pode adicionar um bloco de links apontando para o sistema de IA ou embeds externos."}',
  1
);
