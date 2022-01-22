const conexao = require('../conexao');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const segredo = require('../segredo');


async function login(req, res) {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({mensagem: "As propriedades email e senha são obrigatórias."})
    }

    try {
        const { rows, rowCount } = await conexao.query('select * from usuarios where email = $1', [email]);

        if (rowCount <= 0) {
            return res.status(400).json({mensagem: "Não foi encontrado nenhum usuário para o e-mail fornecido, tente novamente com outro endereço de e-mail."});
        }

        const usuario = rows[0];

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

        if (!senhaCorreta) {
            return res.status(400).json({mensagem: "Usuário e/ou senha inválidos!"});
        }

        const { senha:_, usuarioSemSenha } = usuario;

        const token = jwt.sign({usuarioSemSenha}, segredo, { expiresIn: '2h'});

        return res.status(200).json({token});
    }
    catch (erro) {
        return res.status(500).json({mensagem: "Ocorreu um erro inesperado" + erro.message});
    }
}


module.exports = {
    login
}