const express = require('express');
const controladorUsuarios = require('./controladores/usuarios');
const controladorLogin = require('./controladores/login');

const rotas = express();

rotas.post('/usuario', controladorUsuarios.cadastrarUsuario);
rotas.post('/login', controladorLogin.login)

module.exports = rotas;