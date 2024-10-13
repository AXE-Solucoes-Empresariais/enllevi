import { knex } from "../../database/knexfile";
import { FastifyRequest, FastifyReply } from "fastify";

export async function getVendas(request: FastifyRequest <{ Querystring: { page: string, pageSize: string } }>) {
  const page = parseInt(request.query.page || '1', 10);
  const pageSize = parseInt(request.query.pageSize || '3', 10);

  const offset = (page - 1) * pageSize;

  const vendas = await knex('vendas')
                          .join('produtos', 'produtos.codProduto', '=', 'vendas.codProduto')
                          .join('clientesFornecedores','clientesFornecedores.id', '=', 'vendas.cliente')
                            .select('vendas.id', 'produtos.codProduto', 'produtos.nome',
                                      'vendas.quantidade', 'vendas.preco', 'vendas.total',
                                        'vendas.dataSaida', 'clientesFornecedores.razaoSocial')
                              .limit(pageSize)
                              .offset(offset)
                              .orderBy('vendas.dataSaida', 'asc');

  return vendas;
};

export async function postVendas(request: FastifyRequest <{ Body: { 
                                                              codEan: string, 
                                                              quantidade: number, 
                                                              preco: number,
                                                              cliente: string
                                                            } }>, reply: FastifyReply) {
  const { codEan, quantidade, preco, cliente } = request.body;

  const { codProduto } = await knex('produtos')
                                .where({ codEan })
                                  .first('codProduto');

  if (!codProduto) {
    return reply.status(404).send({ error: 'Produto não encontrado!' });
  }

  const produtoEstoque = await knex('estoque')
                                .where({ codProduto })
                                  .first('quantidade');
                                     
  if (!produtoEstoque || produtoEstoque.quantidade <= 0) {
    return reply.status(400).send({ error: 'Estoque insuficiente para a venda!' });
  }
  
  if (produtoEstoque.quantidade < quantidade) {
    return reply.status(400).send({ error: 'Estoque insuficiente para a venda!' });
  }

  if (quantidade <= 0) {
    return reply.status(400).send({ error: 'Por favor, inserir uma quantidade para esta venda!' });
  }

  if (preco <= 0) {
    return reply.status(400).send({ error: 'Por favor, inserir um valor para esta venda!' });
  }

  const idCliente = await knex('clientesFornecedores')
                            .where('id', cliente)
                              .first('id')

  if (!idCliente) {
    return reply.status(400).send({ error: 'Cliente não encontrado!' });
  } 
  
  await knex('vendas')
          .insert({
            codProduto,
            quantidade,
            preco,
            cliente
          });

  reply.status(201).send({ message: 'Venda registrada com sucesso!' });
};

export async function deleteVendas(request: FastifyRequest <{ Params: { id: number } }>, reply: FastifyReply) {
  const { id } = request.params;

  const idVenda = await knex('vendas')
                           .where({ id })
                             .first('id');

  if (!idVenda) {
    return reply.status(404).send({ error: 'Venda não encontrada!' });
  }

  await knex('vendas')
          .delete()
            .where({ id });

  reply.status(201).send({ message: 'Venda deletada com sucesso!' });
};

export async function putVendas(request: FastifyRequest <{ Params: { id: number }, Body: {
                                                                                    codEan: string, 
                                                                                    quantidade: number, 
                                                                                    preco: number,
                                                                                    cliente: string
                                                                                  } }>, reply: FastifyReply) {
  const { id } = request.params;
  const { codEan, quantidade, preco, cliente } = request.body;

  const idVenda = await knex('vendas')
                          .where({ id })
                            .first('id');

  if (!idVenda) {
  return reply.status(404).send({ error: 'Venda não encontrada!' });
  }

  const { codProduto } = await knex('produtos')
                                .where({ codEan })
                                  .first('codProduto');

  if (!codProduto) {
    return reply.status(404).send({ error: 'Produto não encontrado!' });
  }

  const produtoEstoque = await knex('estoque')
                                .where({ codProduto })
                                  .first('quantidade');
                                     
  if (!produtoEstoque || produtoEstoque.quantidade <= 0) {
    return reply.status(400).send({ error: 'Estoque insuficiente para a venda!' });
  }
  
  if (produtoEstoque.quantidade < quantidade) {
    return reply.status(400).send({ error: 'Estoque insuficiente para a venda!' });
  }

  if (quantidade <= 0) {
    return reply.status(400).send({ error: 'Por favor, inserir uma quantidade para esta venda!' });
  }

  if (preco <= 0) {
    return reply.status(400).send({ error: 'Por favor, inserir um valor para esta venda!' });
  }

  const idCliente = await knex('clientesFornecedores')
                            .where('id', cliente)
                              .first('id')

  if (!idCliente) {
    return reply.status(400).send({ error: 'Cliente não encontrado!' });
  } 
  
  await knex('vendas')
          .update({
            codProduto,
            quantidade,
            preco,
            cliente
          })
            .where({ id });

  reply.status(201).send({ message: 'Venda atualizada com sucesso!' });  
};

export async function getVendasRelatorio(request: FastifyRequest <{ Params: { codProduto: string } }>, reply: FastifyReply) {
  const { codProduto } = request.params;

  const vendaId = await knex('vendas')
                          .where({ codProduto })
                            .first('id');

  if (!vendaId) {
    return reply.status(404).send({ error: 'Não existe venda deste produto!' });
  }

  const codigoP = await knex('produtos')
                          .where({ codProduto })
                            .first('codProduto');

  const produtoCod = codigoP.codProduto;

  if (!codigoP) {
    return reply.status(404).send({ error: 'Produto não encontrado!' });
  }

  const nomeProduto = await knex('vendas')
                              .join('produtos', 'produtos.codProduto', '=', 'vendas.codProduto')
                                .where('produtos.codProduto', codProduto)
                                  .first('produtos.nome');

  const nomeP = nomeProduto.nome;

  const mediaProduto = await knex('vendas')
                              .join('produtos', 'produtos.codProduto', '=', 'vendas.codProduto')
                                .where('produtos.codProduto', codProduto)
                                  .avg('vendas.preco as media_preco');

  const media = mediaProduto[0].media_preco;
  const formato = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const mediaFormatado = formato.format(media);

  const quantidadeProduto = await knex('vendas')
                                    .join('produtos', 'produtos.codProduto', '=', 'vendas.codProduto')
                                      .where('produtos.codProduto', codProduto)
                                        .sum('vendas.quantidade as quantidade_produto');

  const quantidade = quantidadeProduto[0].quantidade_produto;

  const totalProduto = await knex('vendas')
                              .join('produtos', 'produtos.codProduto', '=', 'vendas.codProduto')
                                .where('produtos.codProduto', codProduto)
                                  .sum('vendas.total as total_preco');

  const total = totalProduto[0].total_preco;
  const formata = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const totalFormatado = formata.format(total);

  return { produtoCod, nomeP, mediaFormatado, quantidade, totalFormatado };
};
