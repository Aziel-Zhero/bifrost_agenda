
# Bifrost Central - Sistema de Gestão para Studios

Bem-vindo ao **Bifrost Central**, um sistema de gerenciamento robusto e intuitivo, projetado para otimizar a administração de estúdios, salões e negócios baseados em agendamentos. A plataforma centraliza a gestão de clientes, agendamentos e finanças, capacitando os administradores com ferramentas eficientes e insights claros.

## A Mitologia por Trás do Sistema

A arquitetura e os nomes de papéis no sistema são inspirados na mitologia nórdica, criando uma analogia que guia a lógica e as permissões de acesso.

### A Bifrost: A Ponte Entre Mundos

Na mitologia, a **Bifrost** é a ponte de arco-íris que conecta **Asgard** (o reino dos deuses) a **Midgard** (o reino dos mortais).

- **O Sistema como a Bifrost:** Nosso aplicativo é a própria ponte. Ele conecta o mundo do seu estúdio (Asgard) ao mundo dos seus clientes e operações diárias (Midgard), garantindo que a comunicação e os processos fluam de maneira harmoniosa e segura.

### Os Papéis de Usuário

Cada tipo de usuário no sistema recebe o nome de uma figura ou reino nórdico, refletindo seu nível de acesso e responsabilidade:

- **Bifrost:** Representa o superadministrador ou o dono da plataforma, com acesso total e irrestrito a todas as funcionalidades e configurações do sistema. Este é o nível mais alto de controle.

- **Heimdall:** O guardião da Bifrost. Este papel é designado ao **administrador mestre** de um estúdio. Assim como Heimdall, ele tem uma visão ampla e privilegiada, podendo gerenciar todos os usuários, agendamentos e relatórios, garantindo a ordem e a segurança do seu "reino".

- **Asgard:** O reino dos deuses, governado por Odin. Este papel representa os **administradores comuns** ou profissionais do estúdio (maquiadores, tatuadores, etc.). Eles têm acesso às ferramentas essenciais para realizar seu trabalho: gerenciar seus próprios clientes, agendar horários e visualizar seus próprios relatórios de desempenho.

- **Midgard:** O reino dos humanos. Embora não seja um papel de login direto, **Midgard** representa a esfera dos **clientes finais**, cujas informações e agendamentos são gerenciados pelos usuários de Asgard e supervisionados por Heimdall.

## Proposta e Funcionalidades

O Bifrost Central foi criado para resolver os desafios diários da gestão de um estúdio, oferecendo:

- **Autenticação Segura:** Sistema de login com diferentes níveis de permissão (Bifrost, Heimdall, Asgard).
- **Gestão de Clientes:** Adicione e gerencie perfis de clientes, incluindo informações de contato como WhatsApp e Telegram.
- **Agendamento Inteligente:** Crie e visualize agendamentos em um calendário consolidado, com a possibilidade de reagendar com um simples "arrastar e soltar".
- **Controle de Disponibilidade:** Bloqueie horários e dias específicos para gerenciar a agenda dos profissionais.
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

Clone o repositório e crie um arquivo `.env.local` na raiz do projeto, com base no `.env.example` (se houver). Preencha as seguintes variáveis com as suas chaves do Supabase:

```env
# Variáveis do Supabase (obtenha no seu painel do Supabase)
NEXT_PUBLIC_SUPABASE_URL=SUA_URL_DO_PROJETO
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANON

# Chave de serviço para ações de administrador (obtenha nas configurações de API do seu projeto Supabase)
SUPABASE_SERVICE_ROLE_KEY=SUA_CHAVE_DE_SERVIÇO
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
