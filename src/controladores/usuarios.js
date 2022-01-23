//const { query } = require('express');
const conexao = require('../conexao');
const bcrypt = require('bcrypt');

async function cadastrarUsuario(req, res) {
    const usuario = req.body;

    const mensagemDeValidacao = validaCamposObrigatorios(usuario);

    if(mensagemDeValidacao) {
        return res.status(400).json({mensagem: mensagemDeValidacao});
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
    
    } catch (erro){
        return res.status(500).json({mensagem: "Ocorreu um erro inesperado. - " + erro.message});
    }
};

async function detalharUsuario(req, res) {
    return res.status(200).json(req.usuario);
}

async function editarUsuario(req, res) {
    const novosDadosUsuario = req.body;

    const mensagemDeValidacao = validaCamposObrigatorios(novosDadosUsuario);

    if(mensagemDeValidacao) {
        return res.status(400).json({mensagem: mensagemDeValidacao});
    }
    
    try {
        if (req.usuario.email !== novosDadosUsuario) {
            const queryConsultaEmail = "select * from usuarios where email = $1";

            const { rowCount } = await conexao.query(queryConsultaEmail, [novosDadosUsuario.email]);

            if (rowCount > 0) {
                return res.status(400).json({mensagem: "O e-mail informado já está cadastrado."});
            }
        }

        const senhaCriptografada = await bcrypt.hash(novosDadosUsuario.senha, 10);

        const comandoUpdateUsuario = 'update usuarios set nome = $1, email = $2, senha = $3, nome_loja = $4 where id = $5';

        const { rowCount: rowCountUpdate } = await conexao.query(comandoUpdateUsuario, [novosDadosUsuario.nome, novosDadosUsuario.email, senhaCriptografada, novosDadosUsuario.nome_loja, req.usuario.id]);

        if (rowCountUpdate <= 0) {
            return res.status(500).json({mensagem: "Não foi possível atualizar os dados do usuário. Por favor, tente novamente."});
        }

        res.status(204).send();
        
    } catch (erro) {
        return res.status(500).json({mensagem: "Ocorreu um erro inesperado. - " + erro.message});
    }
}

function validaCamposObrigatorios(usuario) {
    if (!usuario.nome) {
        return "A propriedade nome é obrigatória";
    }

    if (!usuario.email) {
        return "A propriedade email é obrigatória";
    }

    if (!usuario.senha) {
        return "A propriedade senha é obrigatória"
    }

    if (!usuario.nome_loja) {
        return "A propriedade nome_loja é obrigatória";
    }
    
}

module.exports = {
    cadastrarUsuario,
    detalharUsuario,
    editarUsuario
}