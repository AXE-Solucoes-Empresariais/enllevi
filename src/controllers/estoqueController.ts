import { knex } from "../../database/knexfile";
import { FastifyRequest, type FastifyReply } from "fastify";

export async function getEstoque(request: FastifyRequest <{ Querystring: { page: string, pageSize: string } }>) {
    const page = parseInt(request.query.page || '1', 10);
    const pageSize = parseInt(request.query.pageSize || '3', 10);

    const offset = (page - 1) * pageSize;

    const estoque = await knex('estoque')
                            .join('produtos', 'produtos.codProduto', '=', 'estoque.codProduto')
                            .join('compras', 'compras.codProduto', '=', 'produtos.codProduto')
                                .select('produtos.id', 'produtos.codProduto', 'produtos.nome', 
                                            'estoque.quantidade', 'produtos.codEan', 'produtos.codDun', 'compras.lote')
                                    .limit(pageSize)    
                                    .offset(offset)
                                    .orderBy('compras.lote', 'asc');

  return estoque;
};

export async function getEstoqueId(request: FastifyRequest <{ Params: { codProduto: string }, Querystring: { page: string, pageSize: string } }>, reply: FastifyReply) {
    const { codProduto } = request.params;

    const page = parseInt(request.query.page || '1', 10);
    const pageSize = parseInt(request.query.pageSize || '3', 10);

    const offset = (page - 1) * pageSize;

    const codigoP = await knex('produtos')
                            .where({ codProduto })
                                .first('codProduto');

    if (!codigoP) {
        return reply.status(404).send({ error: 'Produto não encontrado!' });
    }

    const estoqueProduto = await knex('estoque')
                                    .join('produtos', 'produtos.codProduto', '=', 'estoque.codProduto')
                                    .join('compras', 'compras.codProduto', '=', 'produtos.codProduto')
                                        .where('estoque.codProduto', codProduto)
                                            .select('produtos.id', 'produtos.codProduto', 'produtos.nome', 
                                                        'estoque.quantidade', 'produtos.codEan', 'produtos.codDun',
                                                            'compras.lote', 
                                                                knex.raw("DATE_FORMAT(compras.dataEntrada, '%d/%m/%Y') AS dataEntrada"),
                                                                knex.raw("DATE_FORMAT(compras.dataEntrada, '%H:%i:%s') AS horarioEntrada"))
                                                .limit(pageSize)    
                                                .offset(offset)
                                                .orderBy('compras.lote', 'asc');

    return estoqueProduto;
};
