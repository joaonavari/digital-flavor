# Digital Flavor — Front-end

Interface web do Digital Flavor, o sistema da cantina escolar: o aluno vê o cardápio, monta o carrinho e acompanha o pedido; a cantina cuida da fila, dos produtos e estoque, das vendas e dos usuários.

Feito com **React + TypeScript (Vite)**, `react-router`, `motion` (animações) e `sonner` (avisos). Os estilos usam CSS Modules e os tokens de `src/styles/tokens.css`. O tema claro ou escuro segue o do sistema operacional.

---

## 1. O que você precisa

| Programa | Versão | Para quê |
|---|---|---|
| [Node.js](https://nodejs.org/) | **LTS 24** (mínimo 22.22) | Rodar o projeto. O `npm` já vem junto |
| [Git](https://git-scm.com/) | qualquer recente | Baixar o repositório |
| Back-end do Digital Flavor | rodando em `http://localhost:8080` | Fornecer os dados (veja o README da raiz) |

> Sem o back-end, dá para usar o **modo de exemplo** (seção 4) só para conhecer as telas.

---

## 2. Passo a passo no Windows

1. **Instale o Node.js LTS.** Baixe o instalador "LTS" em https://nodejs.org e avance com as opções padrão. Ou, no PowerShell:
   ```powershell
   winget install OpenJS.NodeJS.LTS
   ```
2. **Feche e abra o terminal de novo** (para ele enxergar o Node) e confira:
   ```powershell
   node -v
   npm -v
   ```
   O `node -v` precisa mostrar `v24` (ou pelo menos `v22.22`).
3. **Baixe o projeto e entre na pasta do front:**
   ```powershell
   git clone https://github.com/joaonavari/digital-flavor.git
   cd digital-flavor\src\frontend
   ```
4. **Instale as dependências:**
   ```powershell
   npm install
   ```
5. **Crie o arquivo `.env`** a partir do exemplo:
   - PowerShell: `Copy-Item .env.example .env`
   - Prompt de Comando (cmd): `copy .env.example .env`
6. **Rode:**
   ```powershell
   npm run dev
   ```
7. Abra **http://localhost:5173** no navegador.

> **PowerShell bloqueou o `npm`?** Se aparecer "a execução de scripts foi desabilitada neste sistema", use o **Prompt de Comando (cmd)** para os comandos `npm`, ou rode `npm.cmd` no lugar de `npm` (ex.: `npm.cmd install`).

---

## 3. Passo a passo no macOS

1. **Instale o Node.js LTS.** Baixe o instalador `.pkg` "LTS" em https://nodejs.org. Ou, com o [Homebrew](https://brew.sh):
   ```bash
   brew install node@24
   ```
2. **Confira no Terminal:**
   ```bash
   node -v
   npm -v
   ```
   O `node -v` precisa mostrar `v24` (ou pelo menos `v22.22`).
3. **Baixe o projeto e entre na pasta do front:**
   ```bash
   git clone https://github.com/joaonavari/digital-flavor.git
   cd digital-flavor/src/frontend
   ```
4. **Instale as dependências:**
   ```bash
   npm install
   ```
5. **Crie o arquivo `.env`** a partir do exemplo:
   ```bash
   cp .env.example .env
   ```
6. **Rode:**
   ```bash
   npm run dev
   ```
7. Abra **http://localhost:5173** no navegador.

---

## 4. Configuração (`.env`)

| Variável | Padrão | O que faz |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080` | Endereço do back-end |
| `VITE_USE_MOCK` | `false` | `true` usa dados de exemplo guardados no navegador, sem back-end. **Na entrega e no teste de integração fica `false`**: tudo vem da API real |

Depois de mudar o `.env`, pare o servidor (`Ctrl + C`) e rode `npm run dev` de novo.

O `.env` não vai para o Git (já está no `.gitignore`); só o `.env.example` é versionado.

### Contas para testar

São as mesmas nos dados de exemplo e na migração V3 do back (senha `123456` para todas):

| E-mail | Perfil | Abre em |
|---|---|---|
| `aluno@escola.com` | Aluno | Cardápio |
| `funcionario@escola.com` | Funcionário | Fila de pedidos |
| `gerente@escola.com` | Gerente | Fila, Produtos e estoque, Vendas |
| `admin@escola.com` | Administrador | Tudo, inclusive Usuários |

No modo de exemplo, o console do navegador tem dois atalhos: `dfResetarMock()` volta os dados ao início e `dfAjustarEstoque(id, quantidade)` muda o estoque "por fora" (para simular outro aluno comprando).

---

## 5. Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento em http://localhost:5173 (recarrega sozinho ao salvar) |
| `npm run build` | Confere os tipos (TypeScript strict) e gera a versão final em `dist/` |
| `npm run preview` | Abre a versão final gerada pelo `build` |
| `npm run lint` | Procura problemas no código (ESLint) |

Em desenvolvimento existe ainda a página **http://localhost:5173/componentes**, uma vitrine dos componentes com dados de "pior caso" (nomes longos, valores altos). Ela não entra no `build`.

---

## 6. Organização das pastas

```
src/
├── api/            cliente HTTP + uma função por rota do contrato (tipadas)
│   └── mock/       dados de exemplo (só com VITE_USE_MOCK=true)
├── types/          tipos iguais aos JSON da API (CONTRATO_API.md)
├── contexts/       AuthContext (sessão) e CartContext (carrinho)
├── components/     Button, SegmentedControl, Sheet, Switch, TextField, StatusTimeline...
├── layouts/        LayoutAluno (tab bar), LayoutCantina (sidebar), LayoutAcesso
├── pages/          uma pasta por tela
├── hooks/          useRecurso (carregar dados), useFormulario, useMediaQuery
├── lib/            formatação de preço e datas, validações, regras de produto e pedido
├── styles/         tokens.css e global.css
└── main.tsx
```

Rotas: `/login`, `/cadastro`; aluno em `/`, `/pedidos`, `/pedidos/:id`, `/perfil`; cantina em `/cantina/fila`, `/cantina/produtos`, `/cantina/vendas`, `/cantina/usuarios`. Cada perfil só abre as telas dele.

---

## 7. Problemas comuns

| O que aparece | O que fazer |
|---|---|
| `'node' não é reconhecido` / `command not found: node` | O Node não está instalado ou o terminal foi aberto antes da instalação. Instale e abra o terminal de novo |
| `npm install` reclama da versão do Node (`EBADENGINE`) | Atualize para o Node LTS 24 |
| `Port 5173 is in use` | Outro `npm run dev` está aberto. Feche-o, ou rode `npm run dev -- --port 5175` |
| "Sem conexão com o servidor" | O back não está rodando em `VITE_API_URL`, ou o endereço no `.env` está errado |
| Erro de **CORS** no console do navegador | O back precisa liberar `http://localhost:5173` (seção 1 do `CONTRATO_API.md`) |
| Mudei o `.env` e nada mudou | Pare o servidor (`Ctrl + C`) e rode `npm run dev` de novo |
| Tela de login volta sozinha | O token venceu ou é inválido (resposta 401); entre de novo |
