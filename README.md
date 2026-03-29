# UNIGRAN Sistema Comercial v2.0

Sistema interno da equipe comercial com painel de administração.

---

## PASSO 1 — Configurar o Supabase (banco de dados)

1. Acesse https://supabase.com e abra seu projeto
2. Vá em **SQL Editor** (ícone de banco no menu lateral)
3. Cole o conteúdo do arquivo `setup.sql` e clique **Run**
4. Cole o conteúdo do arquivo `seed.sql` e clique **Run**

✅ O banco estará pronto com todo o conteúdo migrado do site antigo.

---

## PASSO 2 — Subir o código no GitHub

1. Crie uma conta em https://github.com (se não tiver)
2. Crie um repositório novo (pode ser privado), ex: `unigran-sistema`
3. Faça upload desta pasta toda para o repositório
   - Pelo site do GitHub: clique em "uploading an existing file"
   - **IMPORTANTE:** Não envie a pasta `node_modules/` (ela é pesada e não precisa ir)

---

## PASSO 3 — Configurar as variáveis de ambiente

Antes de subir no Vercel, você precisa dizer ao sistema onde fica o banco.
Não envie o arquivo `.env` para o GitHub (ele já está no .gitignore).
As variáveis serão configuradas no Vercel (passo 4).

As duas variáveis necessárias são:
```
VITE_SUPABASE_URL=https://doqoxypryuiuyctlbcga.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
```

---

## PASSO 4 — Hospedar no Vercel (gratuito)

1. Acesse https://vercel.com e crie conta (pode entrar com o GitHub)
2. Clique em **Add New Project**
3. Selecione o repositório `unigran-sistema`
4. Antes de clicar em Deploy, abra **Environment Variables** e adicione:
   - `VITE_SUPABASE_URL` → `https://doqoxypryuiuyctlbcga.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` → sua chave anon do Supabase
5. Clique em **Deploy**

✅ Em ~2 minutos o site estará no ar com uma URL tipo `unigran-sistema.vercel.app`

---

## Como usar o sistema

### Equipe comercial
- Acesse o site normalmente pelas abas de navegação
- Checklist: os checks ficam salvos no navegador de cada pessoa

### Você (admin)
- Acesse `/admin` ou clique no botão "Admin" no canto do menu
- Senha inicial: `unigran2026` → **mude isso nas Configurações**
- Em **Abas / Seções**: crie, renomeie, reordene, oculte abas
- Clique numa aba para editar os blocos de conteúdo
- Em cada aba, clique **Novo Bloco** e escolha o tipo:
  - 📝 Texto → para o Help da equipe, scripts, procedimentos
  - ✅ Checklist → para rotinas e tarefas
  - 📊 Tabela → para investimentos, ramais, qualquer dado tabular
  - 🔗 Cards de links → para links externos (Drive, docs, etc.)
  - 📋 Templates CRM → para textos copiáveis do RD Station

---

## Manutenção futura

- Para atualizar o site: edite pelo painel Admin (sem tocar em código)
- Para mudanças visuais grandes: edite `src/index.css`
- O Vercel republica automaticamente cada vez que você fizer push no GitHub
