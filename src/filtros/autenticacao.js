const jwt = require('jsonwebtoken');
const segredo = require('../segredo');
const conexao = require('../conexao');

async function validaToken(req, res, next) {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({mensagem: "Para acessar este recurso, o usuário deverá enviar um token válido."});
    }

    try {
        const token = authorization.replace('Bearer ', '').trim();

        const usuario = jwt.verify(token, segredo);

        const {rows, rowCount} = await conexao.query("select * from usuarios where id = $1", [usuario.id]);

        if (rowCount <= 0 ) {
            return res.status(401).json({mensagem: "Usuário não encontrado no banco de dados."});
        }

        const { senha:_, ...usuarioEncontrado } = rows[0];

        req.usuario = usuarioEncontrado;

        next();

    } catch (erro) {
        if (erro.nome === 'JsonWebTokenError' || erro.nome === 'TokenExpiredError') {
            return res.status(401).json({mensagem: "Para acessar este recurso, o usuário deverá enviar um token válido."});
        }

        return res.status(500).json({mensagem: "Ocorreu um erro inesperado" + erro.message});
    }
}

module.exports = validaToken;