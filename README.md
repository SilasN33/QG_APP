<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:1a1a2e,50:16213e,100=0f3460&height=200&section=header&text=QG%20Open%202026&fontSize=60&fontColor=e94560&animation=fadeIn&fontAlignY=38&desc=Plataforma%20de%20Torneio%20de%20Tênis&descAlignY=60&descColor=ffffff" width="100%" />

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

<br/>

> **Gerencie torneios de tênis de ponta a ponta** — grupos, chaveamento, partidas, ranking e muito mais.

</div>

---

## ✨ Funcionalidades

<table>
  <tr>
    <td>🎾 <b>Dashboard</b></td>
    <td>Visão geral do torneio com estatísticas em tempo real</td>
  </tr>
  <tr>
    <td>👥 <b>Grupos</b></td>
    <td>Fase de grupos A, B, C e D com tabela de classificação</td>
  </tr>
  <tr>
    <td>🏆 <b>Chaveamento</b></td>
    <td>Bracket interativo para quartas, semis e finais</td>
  </tr>
  <tr>
    <td>📅 <b>Calendário</b></td>
    <td>Agendamento e acompanhamento de partidas por data</td>
  </tr>
  <tr>
    <td>📊 <b>Ranking</b></td>
    <td>Classificação geral com pontos, sets e games</td>
  </tr>
  <tr>
    <td>👤 <b>Perfil</b></td>
    <td>Perfil do jogador com histórico de partidas</td>
  </tr>
  <tr>
    <td>🔐 <b>Autenticação</b></td>
    <td>Login, cadastro e onboarding via Supabase Auth</td>
  </tr>
  <tr>
    <td>🛠️ <b>Admin</b></td>
    <td>Painel administrativo para jogadores e partidas</td>
  </tr>
</table>

---

## 🗺️ Estrutura do Projeto

```
qg-open-2026/
├── src/
│   ├── app/
│   │   ├── (app)/              # Rotas protegidas da aplicação
│   │   │   ├── dashboard/      # Painel principal
│   │   │   ├── grupos/         # Fase de grupos
│   │   │   ├── chaveamento/    # Bracket do torneio
│   │   │   ├── calendario/     # Agenda de partidas
│   │   │   ├── ranking/        # Classificação geral
│   │   │   ├── perfil/         # Perfil do jogador
│   │   │   └── partidas/       # Registro de resultados
│   │   ├── (auth)/             # Fluxo de autenticação
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   ├── setup/
│   │   │   └── onboarding/
│   │   └── admin/              # Painel administrativo
│   ├── components/
│   │   ├── layout/             # AppHeader, SidebarNav, BottomNav...
│   │   ├── panels/             # Painéis contextuais (ScheduleMatch...)
│   │   └── ui/                 # Componentes base (Button, Badge, Card...)
│   ├── lib/
│   │   ├── actions/            # Server Actions (criar partida, jogador...)
│   │   ├── queries/            # Consultas Supabase (standings, matches...)
│   │   └── supabase/           # Client, server e tipos do banco
│   └── types/                  # Tipos globais TypeScript
├── public/                     # Assets estáticos
├── tailwind.config.ts
├── next.config.ts
└── tsconfig.json
```

---

## 🚀 Como Rodar Localmente

### Pré-requisitos

- Node.js **18+**
- Conta no [Supabase](https://supabase.com/)

### 1. Clone o repositório

```bash
git clone https://github.com/SilasN33/qg_app.git
cd qg_app
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
```

### 4. Configure o banco de dados

Execute o script de migrations no seu projeto Supabase:

```
src/lib/supabase/migrations.sql
```

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) 🎾

---

## 🧱 Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| UI Library | [React 19](https://react.dev/) |
| Linguagem | [TypeScript 5](https://www.typescriptlang.org/) |
| Banco de Dados | [Supabase](https://supabase.com/) (PostgreSQL) |
| Autenticação | Supabase Auth + SSR |
| Estilização | [Tailwind CSS 3](https://tailwindcss.com/) |
| Ícones | [Lucide React](https://lucide.dev/) |
| Utilitários | clsx, tailwind-merge, date-fns |

---

## 📋 Fases do Torneio

```
Fase de Grupos (A · B · C · D)
        │
        ▼
   Quartas de Final
        │
        ├──► Semifinais
        │         │
        │         └──► Final 🏆
        │
        └──► Consolação (Quartas → Semis → Final)
```

---

## 📱 Design Responsivo

| Dispositivo | Navegação |
|-------------|-----------|
| 📱 Mobile | Bottom Navigation Bar |
| 💻 Tablet | Icon Rail (sidebar compacta) |
| 🖥️ Desktop | Sidebar completa com labels |

---

## 🤝 Contribuindo

```bash
# Crie uma branch para sua feature
git checkout -b feature/minha-feature

# Faça o commit das suas mudanças
git commit -m "feat: adiciona minha feature"

# Envie para o repositório
git push origin feature/minha-feature

# Abra um Pull Request 🎉
```

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f3460,50:16213e,100:1a1a2e&height=120&section=footer" width="100%" />

Feito com ❤️ por **[SilasN33](https://github.com/SilasN33)**

</div>
