const express = require('express');
const controladorUsuarios = require('./controladores/usuarios');
const controladorLogin = require('./controladores/login');
const validaToken = require('./filtros/autenticacao');

const rotas = express();

rotas.post('/usuario', controladorUsuarios.cadastrarUsuario);
rotas.post('/login', controladorLogin.login);

rotas.use(validaToken);

rotas.get('/usuario', controladorUsuarios.detalharUsuario);
rotas.put('/usuario', controladorUsuarios.editarUsuario);


module.exports = rotas;