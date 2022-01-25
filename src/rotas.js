const express = require('express');
const controladorUsuarios = require('./controladores/usuarios');
const controladorLogin = require('./controladores/login');
const controladorProdutos = require('./controladores/produtos');

const validaToken = require('./filtros/autenticacao');

const rotas = express();

rotas.post('/usuario', controladorUsuarios.cadastrarUsuario);
rotas.post('/login', controladorLogin.login);

//Autenticação: todas as rotas abaixdo desta, necessitarão de validação por token.
rotas.use(validaToken);

rotas.get('/perfil', controladorUsuarios.detalharUsuario);
rotas.put('/perfil', controladorUsuarios.editarUsuario);

rotas.get('/produtos', controladorProdutos.listarProdutos);
rotas.get('/produtos/:id', controladorProdutos.detalharProduto);
rotas.post('/produtos', controladorProdutos.cadastrarProduto);
rotas.put('/produtos/:id', controladorProdutos.editarProduto);

module.exports = rotas;