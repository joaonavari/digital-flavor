# Back-end

API REST do Digital Flavor em Java 17 + Spring Boot 3, com MySQL.

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
