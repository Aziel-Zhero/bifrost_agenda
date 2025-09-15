

# Agenda - Sistema de Gestão para Studios

Bem-vindo à **Agenda**, um sistema de gerenciamento robusto e intuitivo, projetado para otimizar a administração de estúdios, salões e negócios baseados em agendamentos. A plataforma centraliza a gestão de clientes, agendamentos e finanças, capacitando os administradores com ferramentas eficientes e insights claros.

## A Mitologia por Trás do Sistema

A arquitetura e os nomes de papéis no sistema são inspirados na mitologia nórdica, criando uma analogia que guia a lógica e as permissões de acesso.

### A Bifrost: A Ponte Entre Mundos

Na mitologia, a **Bifrost** é a ponte de arco-íris que conecta **Asgard** (o reino dos deuses) a **Midgard** (o reino dos mortais). O nosso aplicativo é a própria ponte: ele conecta o mundo do seu estúdio ao mundo dos seus clientes e operações diárias, garantindo que a comunicação e os processos fluam de maneira harmoniosa e segura.

### Os Papéis de Usuário

- **Bifrost:** Superadministrador com acesso total e irrestrito a todas as funcionalidades e configurações.
- **Heimdall:** Administrador mestre do estúdio, com visão ampla e privilegiada para gerenciar usuários, relatórios e configurações gerais.
- **Asgard:** Profissionais do estúdio (maquiadores, tatuadores, etc.), que gerenciam seus próprios clientes e agendamentos.
- **Midgard:** Representa os **clientes finais**, cujas informações são gerenciadas pelos usuários do sistema.

## Funcionalidades Principais

- **Autenticação Segura:** Sistema de login com diferentes níveis de permissão (Bifrost, Heimdall, Asgard).
- **Gestão de Clientes:** Adicione e gerencie perfis de clientes, incluindo informações de contato como WhatsApp e Telegram.
- **Agendamento Inteligente:** Crie e visualize agendamentos em um calendário consolidado, com a possibilidade de reagendar com um simples "arrastar e soltar".
- **Controle de Disponibilidade:** Bloqueie horários e dias específicos para gerenciar a agenda dos profissionais.
- **Notificações com a GAIA:** Uma assistente com temática mitológica envia notificações via Telegram para a equipe sobre novos agendamentos e para os clientes como confirmação, fortalecendo a comunicação.
- **Status de Agendamento:** Acompanhe o ciclo de vida de cada atendimento com os status: `Agendado`, `Realizado`, `Cancelado` ou `Bloqueado`.
- **Dashboard de Desempenho:** Tenha uma visão em tempo real das métricas mais importantes, como agendamentos realizados, cancelamentos e faturamento.

## Tecnologias Utilizadas

- **Framework:** [Next.js](https://nextjs.org/) (com App Router)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes de UI:** [ShadCN](https://ui.shadcn.com/)
- **Banco de Dados e Autenticação:** [Supabase](https://supabase.io/)
- **Inteligência Artificial:** [Google Genkit](https://firebase.google.com/docs/genkit)

## Como Iniciar o Projeto

### 1. Pré-requisitos

- [Node.js](httpss://nodejs.org/) (versão 18 ou superior)
- [npm](httpss://www.npmjs.com/) ou [yarn](httpss://yarnpkg.com/)

### 2. Configuração do Ambiente

Clone o repositório e crie um arquivo `.env` na raiz do projeto. Preencha as seguintes variáveis:

```env
# Variáveis do Supabase (obtenha no seu painel do Supabase)
NEXT_PUBLIC_SUPABASE_URL=SUA_URL_DO_PROJETO
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANON

# Chave de serviço para ações de administrador (obtenha nas configurações de API do seu projeto Supabase)
SUPABASE_SERVICE_ROLE_KEY=SUA_CHAVE_DE_SERVIÇO

# (Opcional) Credenciais para notificações do Telegram
TELEGRAM_BOT_TOKEN=SEU_TOKEN_DO_BOT_TELEGRAM
TELEGRAM_CHAT_ID=ID_DO_SEU_CHAT_OU_GRUPO
```

### 3. Instalação das Dependências

Execute o seguinte comando para instalar todos os pacotes necessários:

```bash
npm install
```

### 4. Executando o Projeto

Para iniciar o servidor de desenvolvimento, execute:

```bash
npm run dev
```

Abra [http://localhost:9003](http://localhost:9003) no seu navegador para ver a aplicação em funcionamento.
