DROP DATABASE IF EXISTS enllevi;
CREATE DATABASE enllevi;
USE enllevi;

CREATE TABLE clientesFornecedores (
	id CHAR(36) NOT NULL DEFAULT(UUID()),
    tipoCadastro ENUM('FORNECEDOR', 'CLIENTE') NOT NULL,
    cpfCNPJ VARCHAR(255) NOT NULL UNIQUE,
    
	razaoSocial VARCHAR(255) NOT NULL,
    nomeFantasia VARCHAR(255),
    endereco VARCHAR(255) NOT NULL,
    numero VARCHAR(255) NOT NULL,
    bairro VARCHAR(255) NOT NULL,
    cep VARCHAR(255) NOT NULL,
    cidade VARCHAR(255) NOT NULL,
    rgIE VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255),
    contato VARCHAR(255),
    
    PRIMARY KEY(id)
);

CREATE TABLE produtos (
	id CHAR(36) NOT NULL DEFAULT(UUID()),
    codProduto CHAR(5) NOT NULL UNIQUE,
    nome VARCHAR(255) NOT NULL,
    codEan CHAR(13) NOT NULL UNIQUE,
    codDun CHAR(14) NOT NULL UNIQUE,
    
    PRIMARY KEY(id)
);

CREATE TABLE estoque (
	id CHAR(36) NOT NULL DEFAULT(UUID()),
    codProduto CHAR(5) NOT NULL, /* FOREIGN KEY */ 
    quantidade INT NOT NULL,
    
    PRIMARY KEY(id),
    FOREIGN KEY(codProduto) REFERENCES produtos(codProduto)
);

CREATE TABLE IF NOT EXISTS lotes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sequenciaLote INT NOT NULL
);

CREATE TABLE compras (
	id CHAR(36) NOT NULL DEFAULT(UUID()),
    codProduto CHAR(5) NOT NULL,
    quantidade INT NOT NULL,
    preco DECIMAL NOT NULL,
    total DECIMAL(10, 2) GENERATED ALWAYS AS (quantidade * preco) STORED,
    fornecedor CHAR(36) NOT NULL,
    nfEntrada INT NOT NULL,
    dataEntrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lote INT NULL,
    
    PRIMARY KEY(id)
);
truncate lotes;
select * from compras;
CREATE TABLE vendas (
	id CHAR(36) NOT NULL DEFAULT(UUID()),
    cliente CHAR(36) NOT NULL,
    codProduto CHAR(5) NOT NULL,
    quantidade INT NOT NULL,
    preco DECIMAL NOT NULL,
    total DECIMAL(10, 2) GENERATED ALWAYS AS (quantidade * preco) STORED,
    dataSaida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY(id)
);

/* ----------------------------------------------------------------------------------------------------------------------
CREATE PROCEDURE atualizaEstoque(id_prod int, quantidadeEntrada int)
	BEGIN
		DECLARE contador INT;
        
        SELECT count(*) into contador FROM estoque WHERE codProduto = id_prod;
        
        IF contador > 0 THEN
			UPDATE estoque SET quantidade = quantidade + quantidadeEntrada
            WHERE codProduto = id_prod;
		ELSE 
			INSERT INTO estoque(codProduto, quantidade) VALUES (id_prod, quantidadeEntrada);
		END IF;

	END
----------------------------------------------------------------------------------------------------------------------
CREATE PROCEDURE reorganizar_lotes()
BEGIN
    SET @i := 0;
    UPDATE compras
    SET lote = (@i := @i + 1)
    ORDER BY dataEntrada;

    UPDATE lotes
    SET sequenciaLote = @i + 1;
END
----------------------------------------------------------------------------------------------------------------------
CREATE TRIGGER `entradaLote_BI` BEFORE INSERT ON `compras`
FOR EACH ROW
	BEGIN
		DECLARE next_lote INT;
    
		INSERT IGNORE INTO lotes (sequenciaLote) VALUES (1);

		SELECT sequenciaLote INTO next_lote FROM lotes ORDER BY id DESC LIMIT 1;

		SET NEW.lote = next_lote;

		UPDATE lotes SET sequenciaLote = next_lote + 1;
END;
---------------------------------------------------------------------------------------------------------------------- 
CREATE TRIGGER entradaProduto_AI AFTER INSERT ON compras
FOR EACH ROW 
	BEGIN
		CALL atualizaEstoque (new.codProduto, new.quantidade);
	END;
---------------------------------------------------------------------------------------------------------------------- 
CREATE TRIGGER entradaProduto_AU AFTER UPDATE ON compras
FOR EACH ROW 
	BEGIN
		CALL atualizaEstoque (new.codProduto, new.quantidade - old.quantidade);
	END;
---------------------------------------------------------------------------------------------------------------------- 
CREATE TRIGGER entradaProduto_AD AFTER DELETE ON compras
FOR EACH ROW 
	BEGIN
		CALL atualizaEstoque (old.codProduto, old.quantidade * -1);
	END;
 ----------------------------------------------------------------------------------------------------------------------
CREATE TRIGGER saidaProduto_AI AFTER INSERT ON vendas
FOR EACH ROW
	BEGIN 
		CALL atualizaEstoque (new.codProduto, new.quantidade * -1);
	END;
----------------------------------------------------------------------------------------------------------------------
CREATE TRIGGER saidaProduto_AU AFTER UPDATE ON vendas
FOR EACH ROW
	BEGIN 
		CALL atualizaEstoque (new.codProduto, old.quantidade - new.quantidade);
	END; 
----------------------------------------------------------------------------------------------------------------------
CREATE TRIGGER saidaProduto_AD AFTER DELETE ON vendas
FOR EACH ROW
	BEGIN 
		CALL atualizaEstoque (old.codProduto, old.quantidade);
	END;
---------------------------------------------------------------------------------------------------------------------- */
