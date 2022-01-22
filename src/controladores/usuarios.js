//const { query } = require('express');
const conexao = require('../conexao');
const bcrypt = require('bcrypt');

async function cadastrarUsuario(req, res) {
    const usuario = req.body;

    if (!usuario.nome) {
        return res.status(400).json({mensagem: "A propriedade nome é obrigatória"});
    }

    if (!usuario.email) {
        return res.status(400).json({mensagem: "A propriedade email é obrigatória"});
    }

    if (!usuario.senha) {
        return res.status(400).json({mensagem: "A propriedade senha é obrigatória"});
    }

    if (!usuario.nome_loja) {
        return res.status(400).json({mensagem: "A propriedade nome_loja é obrigatória"});
    }
    
    try {
        const queryConsultaEmail = "select * from usuarios where email = $1";
        const { rowCount } = await conexao.query(queryConsultaEmail, [usuario.email]);

        if (rowCount > 0) {
            return res.status(400).json({mensagem: "O e-mail informado já está cadastrado."});
        }

        const senhaCriptografada = await bcrypt.hash(usuario.senha, 10);

        const comandoInsercaoUsuario = "insert into usuarios (nome, email, senha, nome_loja) values ($1, $2, $3, $4)";

        const { rowCount: rowCountInsercao} = await conexao.query(comandoInsercaoUsuario, [usuario.nome, usuario.email, senhaCriptografada, usuario.nome_loja]);

        if (rowCountInsercao <= 0) {
            return res.status(500).json({mensagem: "Erro ao criar o usuário. Por favor, tente novamente."});    
        }

        return res.status(201).send();
    } 
    catch (erro){
        return res.status(500).json({mensagem: "Ocorreu um erro inesperado. - " + erro.message});
    }
};

module.exports = {
    cadastrarUsuario
}