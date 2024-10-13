import { knex } from "../../database/knexfile";
import { FastifyRequest, type FastifyReply } from "fastify";

export async function getClientes(request: FastifyRequest <{ Querystring: { page: string, pageSize: string } }>) {
  const page = parseInt(request.query.page || '1', 10);
  const pageSize = parseInt(request.query.pageSize || '3', 10);

  const offset = (page - 1) * pageSize;

  const clientes = await knex('clientesFornecedores')
                          .select('*')
                            .where('tipoCadastro', 'CLIENTE')
                              .limit(pageSize)
                              .offset(offset)

  return clientes;
};

export async function getClienteId(request: FastifyRequest <{ Params: { cpfCNPJ: string } }>, reply: FastifyReply) {
  const { cpfCNPJ } = request.params;

  const result = await knex('clientesFornecedores')
                        .where({ cpfCNPJ })
                          .first('cpfCNPJ');
                     
  if (!result) {
    return reply.status(404).send({ error: `Nenhum registro encontrado!` });
  }

  const {tipoCadastro} = await knex('clientesFornecedores')
                              .where({ cpfCNPJ })
                                .first('tipoCadastro');

  if (tipoCadastro != 'CLIENTE') {
    return reply.status(404).send({ error: `CPF/CNPJ não corresponde a um cliente!` });
  }

  const cliente = await knex('clientesFornecedores')
                          .select('*') 
                            .where('tipoCadastro', 'CLIENTE')
                              .andWhere({ cpfCNPJ });
  return cliente;
};

export async function getFornecedores(request: FastifyRequest <{ Querystring: { page: string, pageSize: string } }>) {
  const page = parseInt(request.query.page || '1', 10);
  const pageSize = parseInt(request.query.pageSize || '3', 10);

  const offset = (page - 1) * pageSize;

  const fornecedores = await knex('clientesFornecedores')
                              .select('*')
                                .where('tipoCadastro', 'FORNECEDOR')
                                  .limit(pageSize)
                                  .offset(offset)
                                  
  return fornecedores;
};

export async function getFornecedorId(request: FastifyRequest <{ Params: { cpfCNPJ: string } }>, reply: FastifyReply) {
  const { cpfCNPJ } = request.params;

  const result = await knex('clientesFornecedores')
                        .where({ cpfCNPJ })
                          .first('cpfCNPJ');
                     
  if (!result) {
    return reply.status(404).send({ error: `Nenhum registro encontrado!` });
  }

  const { tipoCadastro } = await knex('clientesFornecedores')
                              .where({ cpfCNPJ })
                                .first('tipoCadastro');

  if (tipoCadastro != 'FORNECEDOR') {
    return reply.status(404).send({ error: `CPF/CNPJ não corresponde a um fornecedor!` });
  }

  const fornecedor = await knex('clientesFornecedores')
                            .select('*')
                              .where('tipoCadastro', 'FORNECEDOR')
                                .andWhere({ cpfCNPJ });
                                
  return fornecedor;
};

export async function postclientesFornecedores(request: FastifyRequest <{ Body: { 
                                                                            tipoCadastro: string, 
                                                                            cpfCNPJ: string, 
                                                                            razaoSocial: string,
                                                                            nomeFantasia: string, 
                                                                            endereco: string, 
                                                                            numero: string,
                                                                            bairro: string, 
                                                                            cep: string, 
                                                                            cidade: string,
                                                                            rgIE: string, 
                                                                            email: string, 
                                                                            contato: string
                                                                          } }>, reply: FastifyReply) {
  const { tipoCadastro, cpfCNPJ, razaoSocial, nomeFantasia, endereco, numero, bairro, cep, cidade, rgIE, email, contato } = request.body;

  await knex('clientesFornecedores').insert({
                                      tipoCadastro, 
                                      cpfCNPJ, 
                                      razaoSocial,
                                      nomeFantasia, 
                                      endereco, 
                                      numero,
                                      bairro, 
                                      cep, 
                                      cidade,
                                      rgIE, 
                                      email, 
                                      contato
                                    });

  reply.status(201).send({ message: `${ tipoCadastro } criado com sucesso!` });
};

export async function deleteclientesFornecedores(request: FastifyRequest <{ Params: { id: number } }>, reply: FastifyReply) {
  const { id } = request.params;

  const idCF = await knex('clientesFornecedores')
                      .where({ id })
                        .first('id'); 

  if (!idCF) {
    return reply.status(404).send({ error: `Nenhum registro encontrado!` });
  }

  const { tipoCadastro } = await knex('clientesFornecedores')
                                  .where({ id })
                                    .first('tipoCadastro'); 

  await knex('clientesFornecedores')
          .delete()
            .where({ id });

  reply.status(201).send({ message: `${ tipoCadastro } deletado com sucesso!` });
};

export async function putclientesFornecedores(request: FastifyRequest <{ Params: { id: number }, Body: { 
                                                                                                  tipoCadastro: string, 
                                                                                                  cpfCNPJ: string, 
                                                                                                  razaoSocial: string,
                                                                                                  nomeFantasia: string, 
                                                                                                  endereco: string, 
                                                                                                  numero: string,
                                                                                                  bairro: string, 
                                                                                                  cep: string, 
                                                                                                  cidade: string,
                                                                                                  rgIE: string, 
                                                                                                  email: string, 
                                                                                                  contato: string
                                                                                                } }>, reply: FastifyReply) {
  const { id } = request.params;
  const { tipoCadastro, cpfCNPJ, razaoSocial, nomeFantasia, endereco, numero, bairro, cep, cidade, rgIE, email, contato } = request.body;

  const idCF = await knex('clientesFornecedores')
                      .where({ id })
                        .first('id'); 

  if (!idCF) {
    return reply.status(404).send({ error: `Nenhum registro encontrado!` });
  }

  await knex('clientesFornecedores')
          .update({
            tipoCadastro, 
            cpfCNPJ, 
            razaoSocial,
            nomeFantasia, 
            endereco, 
            numero,
            bairro,
            cep, 
            cidade,  
            rgIE, 
            email, 
            contato
          })
            .where({ id });

  reply.status(201).send({ message: `${ tipoCadastro } atualizado com sucesso!` });
};
