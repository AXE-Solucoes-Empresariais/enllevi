import { deleteclientesFornecedores, getClienteId, getFornecedores, postclientesFornecedores, putclientesFornecedores, getFornecedorId, getClientes } from "../controllers/clientesFornecedoresController";
import { deleteProdutos, getProdutos, getProdutosId, postProdutos, putProdutos } from "../controllers/produtosController";
import { getEstoque, getEstoqueId } from "../controllers/estoqueController";
import { deleteCompras, getCompras, getComprasRelatorio, postCompras, putCompras } from "../controllers/comprasController";
import { deleteVendas, getVendas, getVendasRelatorio, postVendas, putVendas } from "../controllers/vendasController";

import { app } from "./server";

export async function appRoutes() {
  app.get('/clientes/get', getClientes)
  app.get('/clientes/get/:cpfCNPJ', getClienteId)
  app.get('/fornecedores/get', getFornecedores)
  app.get('/fornecedores/get/:cpfCNPJ', getFornecedorId)
  app.post('/clientesFornecedores/post', postclientesFornecedores)
  app.delete('/clientesFornecedores/delete/:id', deleteclientesFornecedores)
  app.put('/clientesFornecedores/put/:id', putclientesFornecedores)

  app.get('/produtos/get', getProdutos)
  app.get('/produtos/get/:codProduto', getProdutosId)
  app.post('/produtos/post', postProdutos)
  app.delete('/produtos/delete/:codProduto', deleteProdutos)
  app.put('/produtos/put/:id', putProdutos)

  app.get('/estoque/get', getEstoque)
  app.get('/estoque/get/:codProduto', getEstoqueId)

  app.get('/compras/get', getCompras)
  app.post('/compras/post', postCompras)
  app.delete('/compras/delete/:id', deleteCompras)
  app.put('/compras/put/:id', putCompras)
  app.get('/compras/relatorio/:codProduto', getComprasRelatorio)

  app.get('/vendas/get', getVendas)
  app.post('/vendas/post', postVendas)
  app.delete('/vendas/delete/:id', deleteVendas)
  app.put('/vendas/put/:id', putVendas)
  app.get('/vendas/relatorio/:codProduto', getVendasRelatorio)
};
