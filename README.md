# Corvo Dev - Plataforma de Aprendizado Avançado

Uma plataforma premium, moderna e completa de gerenciamento e consumo de cursos online, projetada especificamente para o aprendizado de JavaScript e desenvolvimento.

A plataforma conta com dois módulos principais: um **Painel do Estudante** para assistir a aulas, acompanhar o progresso e gerenciar o fluxo de estudos, e um **Painel do Administrador** completo para controle de alunos, criação de módulos e inclusão de aulas.

---

## 🚀 Principais Funcionalidades

### 🎓 Área do Estudante
- **Dashboard Intuitivo:** Visão clara de todos os módulos disponíveis do curso e progresso geral (porcentagem de conclusão).
- **Player de Aulas Avançado:** Assistir a aulas com suporte a vídeo e marcação rápida de conclusão para registro instantâneo do progresso.
- **Redirecionamento Inteligente:** Proteção automática de rotas (`redirectOnUnauthenticated`), garantindo que apenas usuários logados acessem o conteúdo.

### 🛡️ Painel Administrativo
- **Gestão de Alunos:** Criação e remoção de alunos diretamente pela plataforma.
- **Geração Automática de Credenciais:** Ao cadastrar um aluno, a plataforma gera uma senha temporária exclusiva para o primeiro acesso.
- **Controle de Módulos & Aulas:** Criação e remoção dinâmica de módulos de ensino e gerenciamento de suas respectivas aulas.

### 🔒 Autenticação Local e Integrada
- **Login sem Complicações:** Fluxo de login simples e seguro usando o e-mail e a senha criados diretamente no Painel Administrativo.
- **Marca d'água de Propriedade:** Badge dinâmico e sutil com a identidade **Corvo Dev** presente de forma fluida no canto inferior direito de todas as telas.

---

## 🛠️ Stack Tecnológica

A aplicação utiliza uma arquitetura full-stack moderna com tipagem estática e tráfego de dados de ponta a ponta:

- **Frontend:** React 19, Tailwind CSS 4, Wouter (roteamento super leve), Lucide React (ícones modernos).
- **Backend:** Express 4 + tRPC 11 (contratos fortemente tipados, sem necessidade de rotas REST manuais).
- **Banco de Dados & ORM:** Drizzle ORM integrado ao MySQL / TiDB.
- **Ferramentas de Desenvolvimento:** Vite, TypeScript, Vitest (suíte de testes automatizados), Prettier.

---

## 📂 Estrutura de Pastas

```text
├── client/              # Código do frontend (React + Vite)
│   ├── public/          # Arquivos estáticos leves (Favicon, etc.)
│   └── src/
│       ├── _core/       # Hooks globais e infraestrutura (auth, etc.)
│       ├── components/  # Componentes reutilizáveis de UI (shadcn, Watermark, etc.)
│       ├── contexts/    # Contexto global de tema (Dark/Light)
│       ├── lib/         # Inicialização e cliente do tRPC
│       └── pages/       # Páginas principais (Home, Login, Dashboards, Player)
├── drizzle/             # Schemas do banco de dados e arquivos de migração SQL
├── server/              # Código do servidor Express e API
│   ├── _core/           # Infraestrutura do tRPC, Banco de Dados, e helpers
│   ├── auth.ts          # Lógicas de validação e roteamento de autenticação local
│   ├── db.ts            # Operações e queries no banco de dados (Drizzle)
│   └── routers.ts       # Definição e registro de rotas do tRPC
└── shared/              # Constantes e tipos TS compartilhados entre cliente e servidor
```

---

## ⚙️ Configuração e Execução Local

### 1. Pré-requisitos
Certifique-se de ter instalado o [Node.js](https://nodejs.org/) e o gerenciador de pacotes [pnpm](https://pnpm.io/).

### 2. Instalação das Dependências
Instale todos os pacotes necessários executando o comando na raiz do projeto:
```bash
pnpm install
```

### 3. Variáveis de Ambiente
O projeto lê automaticamente variáveis de ambiente injetadas no ambiente de execução. Certifique-se de ter a URL de conexão do banco configurada em `DATABASE_URL` (MySQL/TiDB).

### 4. Executando as Migrações do Banco de Dados
Gere as tabelas estruturadas no seu banco de dados MySQL:
```bash
pnpm db:push
```

### 5. Iniciando em Ambiente de Desenvolvimento
Rode o servidor local de desenvolvimento (com hot-reload automático para client e server):
```bash
pnpm dev
```

### 6. Executando Testes
Para rodar a suíte de testes automatizados com Vitest:
```bash
pnpm test
```

### 7. Verificação de Tipos e Build
Para checar o TypeScript e realizar o build de produção:
```bash
# Validação de tipos
pnpm check

# Build do frontend e do servidor
pnpm build
```

---

## 📝 Licença
Este projeto está sob a licença MIT. Desenvolvido e mantido sob a marca **Corvo Dev**.
