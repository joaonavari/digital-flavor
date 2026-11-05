-- Digital Flavor - schema inicial (MySQL 8)
-- Gerado a partir do DER da 1a entrega, com estes ajustes:
--   * tipo_usuario existe apenas em `usuario` (as subtabelas herdam pela FK);
--   * metodo existe apenas em `pagamento` (idem para pagamento_pix/pagamento_cartao);
--   * pagamento.pedido_id e UNIQUE, garantindo a multiplicidade Pedido 1 -- 0..1 Pagamento;
--   * CHECKs para quantidades e precos nao negativos.

CREATE TABLE usuario (
    id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nome          VARCHAR(120)    NOT NULL,
    email         VARCHAR(160)    NOT NULL,
    senha         VARCHAR(255)    NOT NULL, -- hash BCrypt, nunca a senha em texto puro
    telefone      VARCHAR(20)     NULL,
    ativo         TINYINT(1)      NOT NULL DEFAULT 1,
    tipo_usuario  ENUM('ALUNO','FUNCIONARIO','GERENTE','ADMINISTRADOR') NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_usuario_email ((LOWER(email)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE aluno (
    usuario_id  BIGINT UNSIGNED NOT NULL,
    matricula   VARCHAR(20)     NOT NULL,
    turma       VARCHAR(30)     NULL,
    PRIMARY KEY (usuario_id),
    UNIQUE KEY uk_aluno_matricula (matricula),
    CONSTRAINT fk_aluno_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE funcionario (
    usuario_id          BIGINT UNSIGNED NOT NULL,
    matricula_funcional VARCHAR(20)     NOT NULL,
    turno               VARCHAR(20)     NULL,
    PRIMARY KEY (usuario_id),
    UNIQUE KEY uk_funcionario_matricula (matricula_funcional),
    CONSTRAINT fk_funcionario_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE gerente (
    usuario_id  BIGINT UNSIGNED NOT NULL,
    setor       VARCHAR(60)     NULL,
    PRIMARY KEY (usuario_id),
    CONSTRAINT fk_gerente_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE administrador (
    usuario_id    BIGINT UNSIGNED NOT NULL,
    nivel_acesso  INT             NOT NULL DEFAULT 1,
    PRIMARY KEY (usuario_id),
    CONSTRAINT fk_administrador_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE produto (
    id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nome                VARCHAR(120)    NOT NULL,
    descricao           TEXT            NULL,
    preco               DECIMAL(10,2)   NOT NULL,
    categoria           VARCHAR(60)     NULL,
    quantidade_estoque  INT             NOT NULL DEFAULT 0,
    ativo               TINYINT(1)      NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    CONSTRAINT ck_produto_preco CHECK (preco >= 0),
    CONSTRAINT ck_produto_estoque CHECK (quantidade_estoque >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE pedido (
    id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    aluno_id   BIGINT UNSIGNED NOT NULL,
    data_hora  DATETIME        NOT NULL,
    status     ENUM('RECEBIDO','EM_PREPARO','CANCELADO','PRONTO','ENTREGUE') NOT NULL,
    total      DECIMAL(10,2)   NOT NULL,
    PRIMARY KEY (id),
    KEY idx_pedido_aluno (aluno_id),
    KEY idx_pedido_status (status),
    CONSTRAINT fk_pedido_aluno FOREIGN KEY (aluno_id) REFERENCES aluno (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Composicao: um item nao existe sem o seu pedido (ON DELETE CASCADE).
CREATE TABLE item_pedido (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    pedido_id       BIGINT UNSIGNED NOT NULL,
    produto_id      BIGINT UNSIGNED NOT NULL,
    quantidade      INT             NOT NULL,
    preco_unitario  DECIMAL(10,2)   NOT NULL,
    PRIMARY KEY (id),
    KEY idx_item_pedido_pedido (pedido_id),
    CONSTRAINT fk_item_pedido_pedido FOREIGN KEY (pedido_id) REFERENCES pedido (id) ON DELETE CASCADE,
    CONSTRAINT fk_item_pedido_produto FOREIGN KEY (produto_id) REFERENCES produto (id),
    CONSTRAINT ck_item_pedido_quantidade CHECK (quantidade > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE pagamento (
    id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    pedido_id  BIGINT UNSIGNED NOT NULL,
    valor      DECIMAL(10,2)   NOT NULL,
    data_hora  DATETIME        NOT NULL,
    status     ENUM('PENDENTE','RECUSADO','APROVADO','ESTORNADO') NOT NULL,
    metodo     ENUM('PIX','CARTAO') NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_pagamento_pedido (pedido_id),
    CONSTRAINT fk_pagamento_pedido FOREIGN KEY (pedido_id) REFERENCES pedido (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE pagamento_pix (
    pagamento_id  BIGINT UNSIGNED NOT NULL,
    chave_pix     VARCHAR(140)    NULL,
    codigo_qr     TEXT            NULL,
    PRIMARY KEY (pagamento_id),
    CONSTRAINT fk_pagamento_pix FOREIGN KEY (pagamento_id) REFERENCES pagamento (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Somente o numero mascarado (ex.: **** **** **** 1234). O numero completo nunca e armazenado.
CREATE TABLE pagamento_cartao (
    pagamento_id      BIGINT UNSIGNED NOT NULL,
    numero_mascarado  VARCHAR(24)     NOT NULL,
    bandeira          VARCHAR(30)     NULL,
    parcelas          INT             NOT NULL DEFAULT 1,
    PRIMARY KEY (pagamento_id),
    CONSTRAINT fk_pagamento_cartao FOREIGN KEY (pagamento_id) REFERENCES pagamento (id) ON DELETE CASCADE,
    CONSTRAINT ck_pagamento_cartao_parcelas CHECK (parcelas BETWEEN 1 AND 12)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
