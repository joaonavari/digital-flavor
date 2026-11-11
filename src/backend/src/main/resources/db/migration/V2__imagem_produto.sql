-- Foto opcional do produto, exibida no cardapio do front (campo imagemUrl do contrato).
ALTER TABLE produto ADD COLUMN imagem_url VARCHAR(500) NULL AFTER ativo;
