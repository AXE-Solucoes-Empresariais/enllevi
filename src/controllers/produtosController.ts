import { knex } from "../../database/knexfile";
import { FastifyRequest, type FastifyReply } from "fastify";

export async function getProdutos(request: FastifyRequest <{ Querystring: { page: string, pageSize: string } }>) {
  const page = parseInt(request.query.page || '1', 10);
  const pageSize = parseInt(request.query.pageSize || '3', 10);

  const offset = (page - 1) * pageSize;

  const produtos = await knex('produtos')
                          .select('produtos.id', 'produtos.codProduto', 'produtos.nome', 
                                    'produtos.codEan', 'produtos.codDun')
                            .limit(pageSize)
                            .offset(offset)
                            .orderBy('id', 'asc');

  return produtos;
};

export async function getProdutosId(request: FastifyRequest <{ Params: { codProduto: number } }>, reply: FastifyReply) {
  const { codProduto } = request.params;

  const codigoP = await knex('produtos')
                          .where({ codProduto })
                            .first('codProduto');

  if (!codigoP) {
    return reply.status(404).send({ error: 'Produto não encontrado!' });
  }

  const produto = await knex('produtos')
                          .where({ codProduto })
                            .select('produtos.id', 'produtos.codProduto', 'produtos.nome',
                                      'produtos.codEan', 'produtos.codDun');

  return produto;
};

export async function postProdutos(request: FastifyRequest <{ Body: { 
                                                                codProduto: number, 
                                                                nome: string,
                                                                codEan: string,
                                                                codDun: string    
                                                              } }>, reply: FastifyReply) {
  const { codProduto, nome, codEan, codDun } = request.body;

  await knex('produtos').insert({
                          codProduto,
                          nome,
                          codEan,
                          codDun
                        });

  reply.status(201).send({ message: 'Produto criado com sucesso!' });
};

export async function deleteProdutos(request: FastifyRequest <{ Params: { codProduto: number } }>, reply: FastifyReply) {
  const { codProduto } = request.params;

  const codigoP = await knex('produtos')
                          .where({ codProduto })
                            .first('codProduto');

  if (!codigoP) {
    return reply.status(404).send({ error: 'Produto não encontrado!' });
  }

  await knex('produtos')
          .delete()
            .where({ codProduto });

  reply.status(201).send({ message: 'Produto deletado com sucesso!' });
};

export async function putProdutos(request: FastifyRequest <{ Params: { id: number }, Body: { 
                                                                                      codProduto: number, 
                                                                                      nome: string,
                                                                                      codEan: string,
                                                                                      codDun: string
                                                                                    } }>, reply: FastifyReply) {
  const { id } = request.params;
  const { codProduto, nome, codEan, codDun } = request.body;

  const idProduto = await knex('produtos')
                          .where({ id })
                            .first('id');

  if (!idProduto) {
    return reply.status(404).send({ error: 'Produto não encontrado!' });
  }

  await knex('produtos')
          .update({
            codProduto,
            nome,
            codEan,
            codDun
          })
            .where({ id });

  reply.status(201).send({ message: 'Produto atualizado com sucesso!' });
};
