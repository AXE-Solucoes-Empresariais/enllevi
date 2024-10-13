import { knex } from "../../database/knexfile";
import { FastifyReply, FastifyRequest } from "fastify";

export async function getCompras(request: FastifyRequest <{ Querystring: { page: string, pageSize: string } }>) {
  const page = parseInt(request.query.page || '1', 10);
  const pageSize = parseInt(request.query.pageSize || '3', 10);

  const offset = (page - 1) * pageSize;

  const compras = await knex('compras')
                          .join('produtos', 'produtos.codProduto', '=', 'compras.codProduto')
                          .join('clientesFornecedores', 'clientesFornecedores.id', '=', 'compras.fornecedor')
                            .select('compras.id', 'compras.codProduto', 'produtos.nome', 
                                      'compras.quantidade', 'compras.preco', 'compras.total',
                                        'compras.nfEntrada', 'clientesFornecedores.cpfCNPJ', 'clientesFornecedores.razaoSocial',
                                          'compras.lote')
                              .limit(pageSize)
                              .offset(offset)
                              .orderBy('compras.dataEntrada', 'asc');

  return compras;
};

export async function postCompras(request: FastifyRequest <{ Body: { produtos: { 
                                                                      codProduto: string, 
                                                                      quantidade: number, 
                                                                      preco: number }[],
                                                                    fornecedor: string,
                                                                    nfEntrada: number } }>, reply: FastifyReply) {
  const { produtos, fornecedor, nfEntrada } = request.body;

  const notaEntradaExistente = await knex('compras')
                                      .where({ nfEntrada })
                                        .first('nfEntrada');

  if (notaEntradaExistente) {
    return reply.status(400).send({ error: `Nota Fiscal ${nfEntrada} já foi inserida no sistema!` });
  };

  const idForn = await knex('clientesFornecedores')
                          .where('id', fornecedor)
                            .first('id');
    
  if (!idForn) {
    return reply.status(404).send({ error: `Fornecedor ${fornecedor} não encontrado!` });
  };

  for (const produto of produtos) {
    const { codProduto, quantidade, preco } = produto;
    
    const codigoP = await knex('produtos')
                            .where({ codProduto })
                              .first('codProduto');
    
    if (!codigoP) {
      return reply.status(404).send({ error: `Produto ${codProduto} não encontrado!` });
    };
    
    if (quantidade <= 0) {
      return reply.status(400).send({ error: `Quantidade do produto ${codProduto} deve ser maior que zero!` });
    };
    
    if (preco <= 0) {
      return reply.status(400).send({ error: `Preço do produto ${codProduto} deve ser maior que zero!` });
    };
    
    await knex('compras')
            .insert({
              codProduto,
              quantidade,
              preco,
              fornecedor,
              nfEntrada
            });
  };
  await knex.raw('CALL reorganizar_lotes();');

  return reply.status(201).send({ message: 'Compra registrada com sucesso!' });
};

export async function deleteCompras(request: FastifyRequest <{ Params: { id: string } }>, reply: FastifyReply) {
  const { id } = request.params;

  const idCompra = await knex('compras')
                           .where({ id })
                             .first('id');

  if (!idCompra) {
    return reply.status(404).send({ error: 'Compra não encontrada!' });
  }

  await knex('compras')
          .delete()
            .where({ id });
            
  await knex.raw('CALL reorganizar_lotes();');
  
  return reply.status(201).send({ message: 'Compra deletada com sucesso!' });
};

export async function putCompras(request: FastifyRequest <{ Params: { id: string }, Body: { produtos: { 
                                                                                              codProduto: string, 
                                                                                              quantidade: number, 
                                                                                              preco: number }[],
                                                                                            fornecedor: string,
                                                                                            nfEntrada: number } }>, reply: FastifyReply) {
  const { id } = request.params;
  const { produtos, fornecedor, nfEntrada } = request.body;

  const notaEntradaExistente = await knex('compras')
                                      .where({ nfEntrada })
                                        .first('nfEntrada');

  if (notaEntradaExistente) {
    return reply.status(400).send({ error: `Nota Fiscal ${nfEntrada} já foi inserida no sistema!` });
  };

  const idForn = await knex('clientesFornecedores')
                          .where('id', fornecedor)
                            .first('id');
    
  if (!idForn) {
    return reply.status(404).send({ error: `Fornecedor ${fornecedor} não encontrado!` });
  };

  for (const produto of produtos) {
    const { codProduto, quantidade, preco } = produto;
    
    const codigoP = await knex('produtos')
                            .where({ codProduto })
                              .first('codProduto');
    
    if (!codigoP) {
      return reply.status(404).send({ error: `Produto ${codProduto} não encontrado!` });
    };
    
    if (quantidade <= 0) {
      return reply.status(400).send({ error: `Quantidade do produto ${codProduto} deve ser maior que zero!` });
    };
    
    if (preco <= 0) {
      return reply.status(400).send({ error: `Preço do produto ${codProduto} deve ser maior que zero!` });
    };
    
    await knex('compras')
            .update({
              codProduto,
              quantidade,
              preco,
              fornecedor,
              nfEntrada
            })
              .where({ id });
  };
  await knex.raw('CALL reorganizar_lotes();');

  return reply.status(201).send({ message: 'Compra atualizada com sucesso!' });
};// CORRIGIR PUT PELO NÚMERO DA NF/PEDIDO //

export async function getComprasRelatorio(request: FastifyRequest <{ Params: { codProduto: string } }>, reply: FastifyReply) {
  const { codProduto } = request.params;

  const codigoP = await knex('produtos')
                          .where({ codProduto })
                            .first('codProduto');

  const produtoCod = codigoP.codProduto;

  if (!codigoP) {
    return reply.status(404).send({ error: 'Produto não encontrado!' });
  }

  const nomeProduto = await knex('compras')
                              .join('produtos', 'produtos.codProduto', '=', 'compras.codProduto')
                                .where('produtos.codProduto', codProduto)
                                  .first('produtos.nome');

  const nomeP = nomeProduto.nome;

  const mediaProduto = await knex('compras')
                              .join('produtos', 'produtos.codProduto', '=', 'compras.codProduto')
                                .where('produtos.codProduto', codProduto)
                                  .avg('compras.preco as media_preco');

  const media = mediaProduto[0].media_preco;
  const formato = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const mediaFormatado = formato.format(media);

  const quantidadeProduto = await knex('compras')
                                    .join('produtos', 'produtos.codProduto', '=', 'compras.codProduto')
                                      .where('produtos.codProduto', codProduto)
                                        .sum('compras.quantidade as quantidade_produto');

  const quantidade = quantidadeProduto[0].quantidade_produto;

  const totalProduto = await knex('compras')
                              .join('produtos', 'produtos.codProduto', '=', 'compras.codProduto')
                                .where('produtos.codProduto', codProduto)
                                  .sum('compras.total as total_preco');

  const total = totalProduto[0].total_preco;
  const formata = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const totalFormatado = formata.format(total);

  return { produtoCod, nomeP, mediaFormatado, quantidade, totalFormatado };
};
