# Back-end

API REST do Digital Flavor em Java 17 + Spring Boot 3, com MySQL.

## Endpoints

Autenticação por JWT no cabeçalho `Authorization: Bearer <token>`. Erros sempre no formato `{ "mensagem": "..." }`.

| Método | Rota | Quem pode |
|--------|------|-----------|
| POST | `/api/auth/cadastro` | público (cria um Aluno, 201 `{ token, usuario }`: já sai logado) |
| POST | `/api/auth/login` | público, devolve `{ token, usuario }` |
| GET | `/api/auth/me` | autenticado (inclui telefone; matrícula e turma para ALUNO) |
| GET | `/api/produtos` | público (só ativos com estoque, RN04) |
| GET | `/api/produtos/todos`, `/api/produtos/{id}` | GERENTE, ADMINISTRADOR |
| POST, PUT | `/api/produtos`, `/api/produtos/{id}` (aceitam `imagemUrl`; o PUT também `quantidadeEstoque`) | GERENTE, ADMINISTRADOR |
| DELETE | `/api/produtos/{id}` | GERENTE, ADMINISTRADOR (204 se apagou; 200 com o produto se só desativou, por já ter sido vendido) |
| PATCH | `/api/produtos/{id}/ativo` `{ ativo }` | GERENTE, ADMINISTRADOR (tira ou volta para o cardápio) |
| PATCH | `/api/produtos/{id}/estoque` `{ quantidade }` | GERENTE, ADMINISTRADOR |
| POST | `/api/pedidos` `{ itens: [{ produtoId, quantidade }], pagamento: { metodo, numeroCartao?, bandeira?, parcelas? } }` | ALUNO (RF05, RF07, RF08, RF09) |
| GET | `/api/pedidos/meus` | ALUNO |
| GET | `/api/pedidos/{id}` | o aluno dono, ou FUNCIONARIO, GERENTE, ADMINISTRADOR |
| GET | `/api/pedidos/fila` | FUNCIONARIO, GERENTE, ADMINISTRADOR (RECEBIDO, EM_PREPARO e PRONTO, do mais antigo) |
| PATCH | `/api/pedidos/{id}/status` `{ status }` | FUNCIONARIO, GERENTE, ADMINISTRADOR (só a próxima etapa) |
| POST | `/api/pedidos/{id}/cancelar` | só o aluno dono, enquanto RECEBIDO (devolve estoque e estorna) |
| GET | `/api/vendas?inicio=AAAA-MM-DD&fim=AAAA-MM-DD` | GERENTE, ADMINISTRADOR (RF10, sem cancelados) |
| GET, POST | `/api/usuarios` | ADMINISTRADOR (cria Funcionario, Gerente ou Administrador) |
| PATCH | `/api/usuarios/{id}/ativo` `{ ativo }` | ADMINISTRADOR |

Os formatos de resposta seguem os tipos do front em `src/frontend/src/types/index.ts`.

Códigos de erro: 400 validação, 401 não autenticado ou credenciais inválidas, 403 sem permissão,
404 não encontrado, 422 regra de negócio. A permissão é sempre decidida por `Usuario.possuiPermissao(Acao)`.
CORS liberado para `http://localhost:5173`.

## Organização

```text
src/main/java/br/com/digitalflavor/
├── domain/          # Entidades e regras de negócio (diagrama de classes)
│   ├── usuario/     # Usuario (abstrata) -> Aluno, Funcionario, Gerente, Administrador
│   ├── produto/     # Produto e controle de estoque
│   ├── pedido/      # Pedido ◆ ItemPedido (composição 1:N) e StatusPedido
│   ├── pagamento/   # Pagamento (abstrata) -> PagamentoPix, PagamentoCartao
│   └── exception/   # RegraNegocioException
└── repository/      # Acesso ao banco (Spring Data JPA)

src/main/resources/
├── application.yml
└── db/migration/    # Scripts Flyway (V1 = DER, V2 = foto do produto, V3 = dados iniciais)
```

## Dados iniciais

A migração `V3__dados_iniciais.sql` cria os mesmos produtos, usuários e pedidos de exemplo do mock do front.
Senha de todos: `123456`. Logins: `aluno@escola.com`, `funcionario@escola.com`, `gerente@escola.com`
e `admin@escola.com`. Troque ou desative esses usuários fora do ambiente de desenvolvimento.

## Decisões

- **As regras de negócio ficam nas entidades.** É o `Pedido` que valida o estoque (RN01, RN05),
  baixa (RN02) e devolve o estoque no cancelamento. Assim, as regras são testáveis sem banco.
- **Herança no banco com `JOINED`.** Os dados comuns ficam em `usuario`/`pagamento`, os específicos ficam
  na tabela de cada subclasse, como no DER.
- **Polimorfismo:** `Usuario.possuiPermissao()` (cada perfil define suas permissões) e
  `Pagamento.processar()` (cada forma de pagamento processa à sua maneira).
- **O schema é controlado pelo Flyway.** O Hibernate não cria nem altera tabelas (`ddl-auto: none`).
- **Pagamento simulado.** O PIX gera um código fictício e é aprovado; cartões terminados em `0000`
  são recusados, para demonstrar o fluxo. Só o número mascarado do cartão é armazenado.
- **Concorrência no estoque.** `ProdutoRepository.buscarParaAtualizarEstoque` usa `SELECT ... FOR UPDATE`,
  para que dois pedidos não vendam a mesma última unidade.

## Fluxo de status do pedido

```text
RECEBIDO -> EM_PREPARO -> PRONTO -> ENTREGUE
    \-> CANCELADO (somente enquanto RECEBIDO; devolve o estoque)
```
