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

    if(isNaN(Number(idProduto))) {
        return res.status(400).json({mensagem: "O parâmetro ID deve ser um número inteiro positivo válido."});
    }

    try {
        const query = 'select * from produtos where usuario_id = $1 and id = $2';
        
        const { rows, rowCount } = await conexao.query(query, [usuario.id, idProduto]);

        if (rowCount <= 0) {
            return res.status(404).json({mensagem: "Não foi encontrado um produto cadastrado para o ID informado."});
        }

        return res.status(200).json(rows[0]);
        
    } catch (erro) {
        return res.status(500).json({mensagem: "Ocorreu um erro inesperado. - " + erro.message});
    }
}

async function cadastrarProduto(req, res) {
    const usuario = req.usuario;
    const novoProduto = req.body;

    if(!novoProduto.nome) {
        return res.status(400).json({mensagem: "A propriedade nome é obrigatória"});
    }

    if(!novoProduto.estoque || novoProduto.estoque <= 0|| isNaN(Number(novoProduto.estoque))) {
        return res.status(400).json({mensagem: "A propriedade estoque é obrigatória e deve ser um número inteiro positivo válido."});
    }

    if(!novoProduto.preco) {
        return res.status(400).json({mensagem: "A propriedade preco é obrigatória"});
    }

    if(!novoProduto.descricao) {
        return res.status(400).json({mensagem: "A propriedade descricao é obrigatória"});
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

module.exports = {
    listarProdutos,
    detalharProduto,
    cadastrarProduto
}