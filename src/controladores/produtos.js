const { query } = require('express');
const { rows } = require('pg/lib/defaults');
const conexao = require('../conexao');

async function listarProdutos(req, res) {
    const usuario = req.usuario;

    try {
        const query = 'select * from produtos where usuario_id = $1';   
        const { rows } = await conexao.query(query, [usuario.id]);

        return res.status(200).json(rows);
        
    } catch (erro) {
        return res.status(500).json({mensagem: "Ocorreu um erro inesperado. - " + erro.message});
    }
}

async function detalharProduto(req, res) {
    const usuario = req.usuario;
    const idProduto = req.params.id;

    const mensagemValidacaoIdProduto = validaIdProduto(idProduto);

    if (mensagemValidacaoIdProduto) {
        return res.status(400).json({mensagem: mensagemValidacaoIdProduto});
    }

    try {
        const query = 'select * from produtos where usuario_id = $1 and id = $2';
        const { rows, rowCount } = await conexao.query(query, [usuario.id, idProduto]);

        if (rowCount <= 0) {
            return res.status(404).json({mensagem: "Não foi encontrado produto cadastrado para o ID informado."});
        }

        return res.status(200).json(rows[0]);
        
    } catch (erro) {
        return res.status(500).json({mensagem: "Ocorreu um erro inesperado. - " + erro.message});
    }
}

async function cadastrarProduto(req, res) {
    const usuario = req.usuario;
    const novoProduto = req.body;

    const mensagemValidacao = validaCamposObrigatorios(novoProduto);

    if (mensagemValidacao) {
        return res.status(400).json({mensagem: mensagemValidacao});
    }

    try {
        const comandoInsert = 'insert into produtos (usuario_id, nome, estoque, categoria, preco, descricao, imagem) values ($1, $2, $3, $4, $5, $6, $7)';

        const { rowCount } = await conexao.query(comandoInsert, [usuario.id, novoProduto.nome, novoProduto.estoque, novoProduto.categoria, novoProduto.preco, novoProduto.descricao, novoProduto.imagem]);

        if (rowCount <= 0) {
            return res.status(500).json({mensagem: "Não foi possivel cadastrar o produto, Por favor, tente novamente."});
        }

        return res.status(201).send();
        
    } catch (erro) {
        return res.status(500).json({mensagem: "Ocorreu um erro inesperado. - " + erro.message});
    }
}

async function editarProduto(req, res) {
    const usuario = req.usuario;
    const idProduto = req.params.id;
    const novosDadosProdutos = req.body;

    const mensagemValidacaoIdProduto = validaIdProduto(idProduto);

    if (mensagemValidacaoIdProduto) {
        return res.status(400).json({mensagem: mensagemValidacaoIdProduto});
    }

    const mensagemValidacao = validaCamposObrigatorios(novosDadosProdutos);

    if (mensagemValidacao) {
        return res.status(400).json({mensagem: mensagemValidacao});
    }

    try {
        const validacaoProdutoExiste = await validaSeProdutoExisteEPertenceAoUsuario(usuario.id, idProduto);

        if (validacaoProdutoExiste && validacaoProdutoExiste.statusCode && validacaoProdutoExiste.mensagemValidacao) {
            return res.status(validacaoProdutoExiste.statusCode).json({mensagem: validacaoProdutoExiste.mensagemValidacao});          
        }

        const comandoUpdate = 'update produtos set nome = $1, estoque = $2, categoria = $3, preco = $4, descricao = $5, imagem = $6 where id = $7';

        const { rowCount: rowCountUpdate } = await conexao.query(comandoUpdate, [
            novosDadosProdutos.nome,
            novosDadosProdutos.estoque,
            novosDadosProdutos.categoria,
            novosDadosProdutos.preco,
            novosDadosProdutos.descricao,
            novosDadosProdutos.imagem,
            idProduto
        ]);

        if (rowCountUpdate <= 0) {
            return res.status(500).json({mensagem: "Não foi possível editar o produto. Por favor, tente novamente."});
        }

        return res.status(204).send();

    } catch (erro) {
        return res.status(500).json({mensagem: "Ocorreu um erro inesperado. - " + erro.message});
        
    }

}

async function excluirProduto(req, res) {
    const usuario = req.usuario;
    const idProduto = req.params.id;

    const mensagemValidacaoIdProduto = validaIdProduto(idProduto);

    if (mensagemValidacaoIdProduto) {
        return res.status(400).json({mensagem: mensagemValidacaoIdProduto});
    }

    try {
        const validacaoProdutoExiste = await validaSeProdutoExisteEPertenceAoUsuario(usuario.id, idProduto);

        if (validacaoProdutoExiste && validacaoProdutoExiste.statusCode && validacaoProdutoExiste.mensagemValidacao) {
            return res.status(validacaoProdutoExiste.statusCode).json({mensagem: validacaoProdutoExiste.mensagemValidacao});
        }

        const comandoDelete = 'delete from produtos where id = $1';
        const {rowCount} = await conexao.query(comandoDelete, [idProduto]);

        if (rowCount <= 0) {
            return res.status(500).json({mensagem: "Não foi possível excluir o produto. Por favor, tente novamente."});
        }

        return res.status(204).send();

    } catch (erro) {
        return res.status(500).json({mensagem: "Ocorreu um erro inesperado. - " + erro.message});
    }
}

function validaIdProduto(idProduto) {
    if (isNaN(Number(idProduto))) {
        return "O parâmetro ID deve ser um número inteiro positivo válido.";
    }
}

function validaCamposObrigatorios(produto) {

    if(!produto.nome) {
        return "A propriedade nome é obrigatória.";
    }

    if(!produto.estoque || produto.estoque <= 0|| isNaN(Number(produto.estoque))) {
        return "A propriedade estoque é obrigatória e deve ser um número inteiro positivo válido.";
    }

    if(!produto.preco || produto.preco <= 0 || isNaN(Number(produto.preco))) {
        return "A propriedade preco é obrigatória e deve ser um número inteiro positivo válido.";
    }

    if(!produto.descricao) {
        return "A propriedade descricao é obrigatória.";
    }
}


//Valida se o produto existe e se pertence ao usuário logado.
async function validaSeProdutoExisteEPertenceAoUsuario(idUsuarioLogado, idProduto) {
    const query = 'select * from produtos where id = $1';
    const { rows, rowCount } = await conexao.query(query, [idProduto]);

    if (rowCount <= 0) {
        return {
            statusCode: 404,
            mensagemValidacao: "Não foi encontrado produto cadastrado para o ID informado."
        };
    }

    if (rows[0].usuario_id !== idUsuarioLogado) {
        return {
            statusCode: 403,
            mensagemValidacao: "Este usuário não tem permissão para acessar este recurso." 
        };
    }
}

module.exports = {
    listarProdutos,
    detalharProduto,
    cadastrarProduto,
    editarProduto,
    excluirProduto
}