-- Insere tabela de ramais na aba "Informações Extras"
-- Execute no Supabase SQL Editor

INSERT INTO blocks (section_id, type, title, content, order_index, visible)
SELECT
  s.id,
  'table',
  '📞 Ramais e Contatos',
  jsonb_build_object(
    'subtitle', 'Ramais internos organizados por departamento. Use a busca para encontrar rapidamente.',
    'searchable', true,
    'headers', jsonb_build_array('Setor', 'Nome', 'Ramal'),
    'rows', jsonb_build_array(
      -- CAPTAÇÃO PRESENCIAL
      jsonb_build_array('Captação Presencial', 'Simone (Dir. de Captação)', '3151'),
      jsonb_build_array('Captação Presencial', 'João Adriel (Gestor de Captação)', '3102'),
      jsonb_build_array('Captação Presencial', 'Kauany (Consultora de Captação)', '3159'),
      jsonb_build_array('Captação Presencial', 'Marcela (Consultora de Captação)', '3160'),
      jsonb_build_array('Captação Presencial', 'Laís (Consultora de Captação)', '3150'),
      -- SECRETARIA
      jsonb_build_array('Secretaria', 'Geral (Secretaria / Núc. Apoio Acad.)', '4101'),
      jsonb_build_array('Secretaria', 'Daniele Santos (Arquivo / Doc.)', '4286'),
      jsonb_build_array('Secretaria', 'Geral (Bolsas Estudantis)', '4108'),
      jsonb_build_array('Secretaria', 'Geisa / Hiliê (Documentos)', '4299'),
      jsonb_build_array('Secretaria', 'Robson Lezainski (Provas)', '4125'),
      -- TESOURARIA
      jsonb_build_array('Tesouraria', 'Tania Gargantini', '4257'),
      jsonb_build_array('Tesouraria', 'Geral (Atendimento)', '4182 / 4135'),
      jsonb_build_array('Tesouraria', 'Geral (Cobrança)', '4181'),
      jsonb_build_array('Tesouraria', 'Geral (FIES)', '4273'),
      -- DI / SISTEMA
      jsonb_build_array('DI / Sistema', 'Adriano Câmara (Diretor)', '4115'),
      jsonb_build_array('DI / Sistema', 'Ronei / Marcio (Suporte / Manutenção)', '4131'),
      -- MARKETING
      jsonb_build_array('Marketing', 'Josiane Lopes', '4187'),
      jsonb_build_array('Marketing', 'Nilton Raiol (Criação)', '3125'),
      jsonb_build_array('Marketing', 'Milena Cardinal (Planejamento)', '4210'),
      -- COLÉGIO UNIGRAN
      jsonb_build_array('Colégio Unigran', 'Gislaine Esquivel (Unid. I - Secretaria)', '4105'),
      jsonb_build_array('Colégio Unigran', 'Rivanya Ramos (Unid. II)', '4294'),
      -- DEPARTAMENTOS GERAIS
      jsonb_build_array('Dep. Gerais', 'Thais Aline (Almoxarifado)', '4221'),
      jsonb_build_array('Dep. Gerais', 'Tana Alves (FIES / PROUNI / MS Supera)', '4108 / 4287'),
      jsonb_build_array('Dep. Gerais', 'Karina / Amanda (Pós Graduação - Secretárias)', '4114'),
      -- NÚCLEOS
      jsonb_build_array('Núcleos', 'Daiane (Apoio Cantão - Agro e TPA)', '3137'),
      jsonb_build_array('Núcleos', 'Geral (Estética)', '4201'),
      jsonb_build_array('Núcleos', 'Claudia Beloni (Estética - Coord. Clínica)', '4123'),
      jsonb_build_array('Núcleos', 'Geral (Fisioterapia)', '4163'),
      jsonb_build_array('Núcleos', 'João Vitor (Fisioterapia - Coord. Clínica)', '4213'),
      jsonb_build_array('Núcleos', 'Geral (Jurídico)', '3423 / 5522'),
      jsonb_build_array('Núcleos', 'Elson / Eduardo (NTU)', '4175'),
      jsonb_build_array('Núcleos', 'Talita Muniz (Nutrição)', '4194'),
      jsonb_build_array('Núcleos', 'Geral (Nutrição)', '4214'),
      jsonb_build_array('Núcleos', 'Geral (Odontologia)', '4233'),
      jsonb_build_array('Núcleos', 'Letícia Reis (Odonto - Coord. Clínica)', '4226'),
      jsonb_build_array('Núcleos', 'Geral (Polo Unid. III)', '4150'),
      jsonb_build_array('Núcleos', 'Geral (Psicologia)', '4268'),
      jsonb_build_array('Núcleos', 'Alex Matos (Hosp. Vet. - Coord. Clínica)', '4112'),
      jsonb_build_array('Núcleos', 'Recepção (Hosp. Veterinário)', '4199'),
      -- EAD
      jsonb_build_array('EAD', 'Andréia Felix (Financeiro EAD)', '4296'),
      jsonb_build_array('EAD', 'Edneia (Financeiro EAD - Geral)', '4126'),
      jsonb_build_array('EAD', 'Geral (Secretaria EAD)', '4142 / 4239'),
      jsonb_build_array('EAD', 'Geral (Operações Comerciais)', '4249'),
      -- DEP. PESSOAL
      jsonb_build_array('Dep. Pessoal', 'Talita Inoue', '4149'),
      jsonb_build_array('Dep. Pessoal', 'Raquel Vargas (Recepção)', '4146'),
      jsonb_build_array('Dep. Pessoal', 'Caroline Silva (Secretária)', '4168')
    )
  ),
  (SELECT COALESCE(MAX(order_index), 0) + 1 FROM blocks WHERE section_id = s.id),
  true
FROM sections s
WHERE s.slug = 'informacoes-extras';
