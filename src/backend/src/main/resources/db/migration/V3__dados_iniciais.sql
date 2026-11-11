-- Dados iniciais de desenvolvimento e demonstracao, iguais aos do mock do front
-- (src/frontend/src/api/mock/dados.ts). Senha de todos os usuarios: 123456 (hash BCrypt abaixo).
-- Em um ambiente real, troque ou desative estes usuarios logo apos a instalacao.

SET @senha = '$2a$10$R8lXF86q62Psq61WpkRwtOK4/sooJ3oT5eE8ytoWRKu8b5N2P3M3i';

-- Usuarios (ids fixos para os pedidos de exemplo abaixo)
INSERT INTO usuario (id, nome, email, senha, telefone, ativo, tipo_usuario) VALUES
    (1, 'Maria Souza', 'aluno@escola.com', @senha, '44999998888', 1, 'ALUNO'),
    (2, 'Carlos Lima', 'funcionario@escola.com', @senha, NULL, 1, 'FUNCIONARIO'),
    (3, 'Beatriz Rocha', 'gerente@escola.com', @senha, NULL, 1, 'GERENTE'),
    (4, 'Admin', 'admin@escola.com', @senha, NULL, 1, 'ADMINISTRADOR'),
    (5, 'Ana Paula Ribeiro', 'ana.ribeiro@escola.com', @senha, NULL, 1, 'ALUNO'),
    (6, 'Lucas Martins', 'lucas.martins@escola.com', @senha, NULL, 1, 'ALUNO'),
    (7, 'Julia Rocha', 'julia.rocha@escola.com', @senha, NULL, 1, 'ALUNO'),
    (8, 'Pedro Alves', 'pedro.alves@escola.com', @senha, NULL, 1, 'ALUNO');

INSERT INTO aluno (usuario_id, matricula, turma) VALUES
    (1, '2026001', '3º A'),
    (5, '2026002', '3º A'),
    (6, '2026003', '2º B'),
    (7, '2026004', '1º C'),
    (8, '2026005', '2º A');
INSERT INTO funcionario (usuario_id, matricula_funcional, turno) VALUES (2, 'F001', 'Manhã');
INSERT INTO gerente (usuario_id, setor) VALUES (3, 'Cantina');
INSERT INTO administrador (usuario_id, nivel_acesso) VALUES (4, 10);

-- Produtos (estoque ja descontado dos pedidos abaixo)
INSERT INTO produto (id, nome, descricao, preco, categoria, quantidade_estoque, ativo) VALUES
    (1, 'Coxinha de frango', 'Massa leve, recheio cremoso', 6.50, 'Salgados', 24, 1),
    (2, 'Pão de queijo', 'Porção com 3 unidades', 5.00, 'Salgados', 4, 1),
    (3, 'Esfiha de carne', 'Assada, massa fina', 6.00, 'Salgados', 15, 1),
    (4, 'Suco de laranja', 'Natural, 300 ml', 4.00, 'Bebidas', 18, 1),
    (5, 'Água mineral', 'Sem gás, 500 ml', 3.00, 'Bebidas', 40, 1),
    (6, 'Brownie', 'Chocolate meio amargo', 5.50, 'Doces', 9, 1),
    (7, 'Bolo de cenoura', 'Fatia com cobertura de chocolate', 5.00, 'Doces', 0, 1),
    (8, 'Refrigerante lata', '350 ml', 5.00, 'Bebidas', 30, 0);

-- Pedidos de exemplo: fila em andamento e historico da aluna Maria
INSERT INTO pedido (id, aluno_id, data_hora, status, total) VALUES
    (80, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 12 DAY), '11:15:00'), 'ENTREGUE', 9.00),
    (92, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 5 DAY), '10:15:00'), 'CANCELADO', 5.50),
    (101, 1, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:15:00'), 'ENTREGUE', 17.00),
    (104, 5, DATE_SUB(NOW(), INTERVAL 6 MINUTE), 'PRONTO', 15.00),
    (105, 6, DATE_SUB(NOW(), INTERVAL 4 MINUTE), 'EM_PREPARO', 9.50),
    (106, 7, DATE_SUB(NOW(), INTERVAL 3 MINUTE), 'EM_PREPARO', 6.00),
    (107, 8, DATE_SUB(NOW(), INTERVAL 1 MINUTE), 'RECEBIDO', 8.00);

INSERT INTO item_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES
    (80, 3, 1, 6.00), (80, 5, 1, 3.00),
    (92, 6, 1, 5.50),
    (101, 1, 2, 6.50), (101, 4, 1, 4.00),
    (104, 2, 3, 5.00),
    (105, 6, 1, 5.50), (105, 4, 1, 4.00),
    (106, 3, 1, 6.00),
    (107, 2, 1, 5.00), (107, 5, 1, 3.00);

INSERT INTO pagamento (id, pedido_id, valor, data_hora, status, metodo) VALUES
    (1, 80, 9.00, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 12 DAY), '11:15:00'), 'APROVADO', 'PIX'),
    (2, 92, 5.50, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 5 DAY), '10:15:00'), 'ESTORNADO', 'CARTAO'),
    (3, 101, 17.00, TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:15:00'), 'APROVADO', 'PIX'),
    (4, 104, 15.00, DATE_SUB(NOW(), INTERVAL 6 MINUTE), 'APROVADO', 'PIX'),
    (5, 105, 9.50, DATE_SUB(NOW(), INTERVAL 4 MINUTE), 'APROVADO', 'CARTAO'),
    (6, 106, 6.00, DATE_SUB(NOW(), INTERVAL 3 MINUTE), 'APROVADO', 'PIX'),
    (7, 107, 8.00, DATE_SUB(NOW(), INTERVAL 1 MINUTE), 'APROVADO', 'PIX');

INSERT INTO pagamento_pix (pagamento_id, chave_pix, codigo_qr) VALUES
    (1, 'pix@digitalflavor.com.br', 'DIGITALFLAVOR-PIX|pix@digitalflavor.com.br|9.00'),
    (3, 'pix@digitalflavor.com.br', 'DIGITALFLAVOR-PIX|pix@digitalflavor.com.br|17.00'),
    (4, 'pix@digitalflavor.com.br', 'DIGITALFLAVOR-PIX|pix@digitalflavor.com.br|15.00'),
    (6, 'pix@digitalflavor.com.br', 'DIGITALFLAVOR-PIX|pix@digitalflavor.com.br|6.00'),
    (7, 'pix@digitalflavor.com.br', 'DIGITALFLAVOR-PIX|pix@digitalflavor.com.br|8.00');

INSERT INTO pagamento_cartao (pagamento_id, numero_mascarado, bandeira, parcelas) VALUES
    (2, '**** **** **** 1234', 'VISA', 1),
    (5, '**** **** **** 4821', 'MASTERCARD', 1);
