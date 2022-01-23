const express = require('express');
const controladorUsuarios = require('./controladores/usuarios');
const controladorLogin = require('./controladores/login');
const validaToken = require('./filtros/autenticacao');

const rotas = express();

rotas.post('/usuario', controladorUsuarios.cadastrarUsuario);
rotas.post('/login', controladorLogin.login);

rotas.use(validaToken);

rotas.get('/usuario', async (req, res) => { 
    console.log(req.usuario);
    return res.json('Ok'); 
});


module.exports = rotas;