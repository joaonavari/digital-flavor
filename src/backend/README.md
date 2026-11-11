# Back-end

API REST do Digital Flavor em Java 17 + Spring Boot 3, com MySQL.

## Endpoints

Autenticação por JWT no cabeçalho `Authorization: Bearer <token>`. Erros sempre no formato `{ "mensagem": "..." }`.

| Método | Rota | Quem pode |
|--------|------|-----------|
| POST | `/api/auth/cadastro` | público (cria um Aluno) |
| POST | `/api/auth/login` | público, devolve `{ token, usuario }` |
| GET | `/api/auth/me` | autenticado |
| GET | `/api/produtos` | público (só ativos com estoque, RN04) |
| GET | `/api/produtos/todos`, `/api/produtos/{id}` | GERENTE, ADMINISTRADOR |
| POST, PUT | `/api/produtos`, `/api/produtos/{id}` | GERENTE, ADMINISTRADOR |
| DELETE | `/api/produtos/{id}` | GERENTE, ADMINISTRADOR (apaga se nunca vendido; senão desativa) |
| PATCH | `/api/produtos/{id}/estoque` `{ quantidade }` | GERENTE, ADMINISTRADOR |
| GET, POST | `/api/usuarios` | ADMINISTRADOR (cria Funcionario, Gerente ou Administrador) |
| PATCH | `/api/usuarios/{id}/ativo` `{ ativo }` | ADMINISTRADOR |

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
└── db/migration/    # Scripts Flyway (V1__schema_inicial.sql = DER)
```

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
