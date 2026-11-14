# Digital Flavor

Sistema web para gestão sustentável de cantinas escolares, desenvolvido como AEP do curso de Engenharia de Software da UniCesumar.

## Integrantes

- Luiz Gustavo Lorençone Enz – 25355642-2
- João Vitor Navari Elias Santos – 25001664-2
- Anthony Vinicius Gomes Oliveira – 25127235-2

## Objetivo

Desenvolver uma aplicação web para auxiliar na gestão de cantinas escolares, possibilitando a realização antecipada de pedidos, o gerenciamento de produtos, o controle de estoque e o registro das vendas, contribuindo para maior organização do atendimento e redução de desperdícios.

## ODS

O projeto está alinhado ao **ODS 12 – Consumo e Produção Responsáveis**, com foco no uso mais eficiente dos recursos da cantina e na redução de desperdícios por meio de um melhor controle de estoque e das vendas.

## Tecnologias

### Front-end
- React
- Vite
- TypeScript

### Back-end
- Java
- Spring Boot

### Banco de Dados
- MySQL

## Arquitetura

Fluxo principal da aplicação:

`Usuário -> React/TypeScript -> API REST -> Java/Spring Boot -> MySQL`

## Como executar

Para rodar o sistema completo são necessários o **back-end** (API + MySQL) e o **front-end**, cada um em seu terminal.

Pré-requisitos: Java 17, Maven, Docker e Node.js LTS 24 (mínimo 22.22).

### 1. Back-end

```bash
# 1. Subir o MySQL (na raiz do repositório)
docker compose up -d

# 2. Definir o segredo do JWT (obrigatório, no mínimo 32 caracteres)
export JWT_SECRET="$(openssl rand -base64 48)"   # PowerShell: $env:JWT_SECRET = "..."

# 3. Rodar a API em http://localhost:8080 (o Flyway cria as tabelas e os dados iniciais na primeira execução)
cd src/backend
mvn spring-boot:run

# Testes
mvn test
```

As credenciais padrão de desenvolvimento do banco estão em `.env.example`.

### 2. Front-end

Com o back-end rodando, em outro terminal:

```bash
cd src/frontend
npm install
cp .env.example .env        # PowerShell: Copy-Item .env.example .env | cmd: copy .env.example .env
npm run dev
```

Abra **http://localhost:5173**. O `.env` precisa estar com `VITE_USE_MOCK=false` (já é o valor do `.env.example`), para que as telas usem a API real em `VITE_API_URL=http://localhost:8080`. Se mudar o `.env`, pare o servidor (`Ctrl + C`) e rode `npm run dev` de novo.

O passo a passo detalhado para Windows e macOS, os comandos disponíveis e a solução de problemas comuns estão em [`src/frontend/README.md`](src/frontend/README.md). Os endpoints da API estão em [`src/backend/README.md`](src/backend/README.md).

### Logins de demonstração

Criados pela migração `V3__dados_iniciais.sql`. A senha de todos é `123456`.

| E-mail | Perfil | Acesso |
|---|---|---|
| `aluno@escola.com` | Aluno | Cardápio, carrinho, pedidos e perfil |
| `funcionario@escola.com` | Funcionário | Fila de pedidos |
| `gerente@escola.com` | Gerente | Fila, produtos e estoque, vendas |
| `admin@escola.com` | Administrador | Tudo, inclusive gestão de usuários |

Também é possível criar uma conta de aluno pela tela de cadastro. Esses usuários são apenas para desenvolvimento e demonstração.

## Requisitos do Sistema

### RF01 – Cadastro e autenticação
O sistema deve permitir o cadastro e a autenticação de usuários, contendo as informações necessárias para identificação e acesso à plataforma.

### RF02 – Perfis de acesso
O sistema deve permitir a existência de diferentes perfis de usuários, incluindo aluno, funcionário, gerente e administrador.

### RF03 – Gerenciamento de produtos
O sistema deve permitir que usuários autorizados cadastrem, consultem, alterem e removam produtos da cantina.

### RF04 – Consulta de produtos
O sistema deve permitir que os alunos consultem os produtos disponíveis, incluindo informações como nome, preço e disponibilidade.

### RF05 – Carrinho de compras
O sistema deve permitir que o aluno adicione e remova produtos de um carrinho antes da confirmação do pedido.

### RF06 – Controle de estoque
O sistema deve permitir o armazenamento e gerenciamento das quantidades disponíveis de cada produto.

### RF07 – Verificação de disponibilidade
O sistema deve verificar a quantidade disponível em estoque antes da confirmação de um pedido.

### RF08 – Realização de pedidos
O sistema deve permitir que o aluno realize antecipadamente um pedido contendo um ou mais produtos.

### RF09 – Pagamentos
O sistema deve permitir o registro da forma de pagamento utilizada no pedido, incluindo PIX e cartão.

### RF10 – Consulta de vendas
O sistema deve permitir que usuários autorizados consultem informações relacionadas às vendas e pedidos realizados.

## Regras de Negócio

- **RN01 – Disponibilidade do produto:** um produto somente poderá ser incluído em um pedido caso exista quantidade suficiente disponível em estoque.
- **RN02 – Atualização do estoque:** após a confirmação de uma venda, a quantidade correspondente aos produtos vendidos deverá ser atualizada.
- **RN03 – Controle de acesso:** funcionalidades administrativas somente poderão ser utilizadas por usuários que possuírem permissão para realizá-las.
- **RN04 – Produto sem estoque:** um produto cuja quantidade disponível seja igual a zero não deverá ser apresentado como disponível para compra.
- **RN05 – Validação do pedido:** um pedido somente poderá ser confirmado caso todos os produtos e quantidades solicitadas estejam disponíveis.
- **RN06 – Associação do pedido:** todo pedido deverá estar associado ao usuário responsável por sua realização.

## Estrutura do Repositório

```text
digital-flavor/
├── src/
│   ├── frontend/        # React + Vite + TypeScript
│   └── backend/         # Java + Spring Boot (API REST)
├── docs/                # PDF da AEP, Diagrama de Classes, DER e design
├── database/            # Script SQL do schema
├── docker-compose.yml   # MySQL de desenvolvimento
├── .env.example
├── .gitignore
└── README.md
```

## Cronograma

| Período | Atividade | Responsável | Situação |
|---|---|---|---|
| 11/09/2026 | Definição do escopo, requisitos e arquitetura | Todos | ✅ Concluído |
| 11/09/2026 | Estruturação e elaboração do documento da primeira entrega | João | ✅ Concluído |
| 11/09/2026 | Elaboração do Diagrama de Classes | Luiz e Anthony | ✅ Concluído |
| 11/09/2026 | Elaboração do DER | Luiz e Anthony | ✅ Concluído |
| 11/09/2026 | Criação e organização inicial do repositório GitHub | João | ✅ Concluído |
| 12/09 a 25/09 | Configuração e estruturação do front-end com React, Vite e TypeScript | Equipe | ✅ Concluído |
| 26/09 a 09/10 | Desenvolvimento da estrutura inicial do back-end com Java e Spring Boot | Equipe | ✅ Concluído |
| 10/10 a 23/10 | Estruturação e integração do banco MySQL | Equipe | ✅ Concluído |
| 24/10 a 02/11 | Implementação das operações CRUD e regras de negócio | Equipe | ✅ Concluído |
| 03/11 a 08/11 | Integração entre front-end, back-end e banco de dados | Equipe | ✅ Concluído |
| 09/11 a 11/11 | Realização de testes e correção de problemas | Equipe | ✅ Concluído |
| 12/11/2026 | Revisão do projeto, documentação e organização do repositório | Todos | ✅ Concluído |
| 13/11/2026 | Entrega final da AEP | Todos | ✅ Concluído |

## Documentação

Na pasta [`docs/`](docs/):

- [`AEP_Digital_Flavor_1a_Entrega.pdf`](docs/AEP_Digital_Flavor_1a_Entrega.pdf) – documento da AEP (descoberta, concepção, justificativa técnica, modelagem e cronograma)
- [`Diagrama_Classe_Digital_Flavor.png`](docs/Diagrama_Classe_Digital_Flavor.png) – Diagrama de Classes
- [`DER Digital Flavor.jpeg`](docs/DER%20Digital%20Flavor.jpeg) – Diagrama Entidade-Relacionamento
- [`design/`](docs/design) – mockups e referências de design

## Banco de Dados

A pasta `database/` contém o script SQL do schema. Na execução da API, o banco é criado e populado pelas migrações Flyway em `src/backend/src/main/resources/db/migration/` (V1 = schema, V2 = imagem do produto, V3 = dados iniciais).
