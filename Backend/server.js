require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const rawg = require('./services/rawgService');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Preencha todos os campos" });
    }

    const sql = "SELECT id, username, email, role FROM users WHERE (email = ? OR username = ?) AND password = ?";

    db.query(sql, [email, email, password], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Erro no banco de dados" });
        }
        if (results.length === 0) {
            return res.status(401).json({ error: "Usuário ou senha inválidos" });
        }
        res.json(results[0]);
    });
});

app.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: "Preencha todos os campos" });
    }

    const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";

    db.query(sql, [username, email, password], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: "Usuário ou e-mail já cadastrado" });
            }
            console.error(err);
            return res.status(500).json({ error: "Erro ao criar conta" });
        }
        res.status(201).json({ message: "Usuário cadastrado" });
    });
});

app.get('/games', (req, res) => {
    const limit = 9;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const sqlData = "SELECT * FROM games LIMIT ? OFFSET ?";
    const sqlCount = "SELECT COUNT(*) as total FROM games";

    db.query(sqlCount, (err, countResult) => {
        if (err) return res.status(500).json(err);

        const totalItems = countResult[0].total;
        const totalPages = Math.ceil(totalItems / limit);

        db.query(sqlData, [limit, offset], (err, results) => {
            if (err) return res.status(500).json(err);
            res.json({
                games: results,
                totalPages: totalPages,
                currentPage: page
            });
        });
    });
});

app.get('/games/:id', (req, res) => {
    const { id } = req.params;
    const sql = "SELECT * FROM games WHERE id = ?";

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error("Erro ao buscar:", err);
            return res.status(500).json({ error: "Erro no banco de dados" });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "Jogo não encontrado" });
        }
        res.json(results[0]);
    });
});

app.get('/games/:id/imagem', (req, res) => {
    const { id } = req.params;

    db.query("SELECT mime, dados FROM game_imagens WHERE game_id = ?", [id], (err, rows) => {
        if (err) {
            console.error("Erro ao buscar imagem:", err);
            return res.status(500).send("erro");
        }

        if (rows.length > 0 && rows[0].dados) {
            res.set('Content-Type', rows[0].mime || 'image/jpeg');
            res.set('Cache-Control', 'public, max-age=86400');
            return res.send(rows[0].dados);
        }

        db.query("SELECT url_imagem FROM games WHERE id = ?", [id], (err2, grows) => {
            if (!err2 && grows.length > 0 && grows[0].url_imagem) {
                return res.redirect(grows[0].url_imagem);
            }
            return res.redirect('https://via.placeholder.com/280x160?text=Sem+Capa');
        });
    });
});

function queryAsync(sql, params) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, result) => (err ? reject(err) : resolve(result)));
    });
}

async function preencherImagemEDescricao(gameId, titulo, urlManual, descricaoManual) {
    try {
        let url = urlManual;
        if (!url) url = await rawg.buscarUrlImagem(titulo);
        if (url) {
            const { mime, buffer } = await rawg.baixarImagem(url);
            await queryAsync(
                "INSERT INTO game_imagens (game_id, mime, dados) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE mime = VALUES(mime), dados = VALUES(dados)",
                [gameId, mime, buffer]
            );
            if (!urlManual) {
                await queryAsync("UPDATE games SET url_imagem = ? WHERE id = ?", [url, gameId]);
            }
        }
    } catch (e) {
        console.error("auto-imagem falhou:", e.message);
    }

    try {
        if (!descricaoManual || !descricaoManual.trim()) {
            const sobre = await rawg.buscarSobreTraduzido(titulo);
            if (sobre) {
                await queryAsync("UPDATE games SET descricao = ? WHERE id = ?", [sobre, gameId]);
            }
        }
    } catch (e) {
        console.error("auto-descrição falhou:", e.message);
    }
}

app.post('/games', (req, res) => {
    const { titulo, genero, plataforma, ano_lanc, preco, trofeus, url_imagem, descricao } = req.body;

    if (!titulo || !genero || !plataforma || !ano_lanc || preco === undefined || trofeus === undefined) {
        return res.status(400).json({ error: "Preencha todos os Campos" });
    }

    const sql = "INSERT INTO games (titulo, genero, plataforma, ano_lanc, preco, trofeus, url_imagem, descricao) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    db.query(sql, [titulo, genero, plataforma, ano_lanc, preco, trofeus, url_imagem || null, descricao || null], async (err, result) => {
        if (err) {
            console.error("não inseriu o jogo:", err);
            return res.status(500).json({ error: "não cadastrou"});
        }

        const novoId = result.insertId;

        await preencherImagemEDescricao(novoId, titulo, url_imagem, descricao);

        res.status(201).json({ message: "foi cadastrado", id: novoId });
    });
});

app.delete('/games/:id', (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM games WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("não deletouo  jogo:", err);
            return res.status(500).json({ error: "não excluiu o jogo" });
        }
        res.json({ message: "jogo foi exluido" });
    });
});

app.put('/games/:id', (req, res) => {
    const { id } = req.params;
    const { titulo, genero, plataforma, ano_lanc, preco, trofeus, url_imagem, descricao } = req.body;

    if (!titulo || !genero || !plataforma || !ano_lanc || preco === undefined || trofeus === undefined) {
        return res.status(400).json({ error: "Preencha todos os Campos" });
    }

    const sql = "UPDATE games SET titulo = ?, genero = ?, plataforma = ?, ano_lanc = ?, preco = ?, trofeus = ?, url_imagem = ?, descricao = ? WHERE id = ?";

    db.query(sql, [titulo, genero, plataforma, ano_lanc, preco, trofeus, url_imagem || null, descricao || null, id], (err, result) => {
        if (err) {
            console.error("não atualizou:", err);
            return res.status(500).json({ error: "não editou o jogo" });
        }
        res.json({ message: "atualizou o jogo"});
    });
});

app.get('/games/:id/reviews', (req, res) => {
    const { id } = req.params;

    const sql = "SELECT reviews.id, reviews.texto, reviews.tipo, reviews.data_coment, reviews.user_id, users.username, users.role FROM reviews JOIN users ON reviews.user_id = users.id WHERE reviews.game_id = ? ORDER BY reviews.data_coment DESC";

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error("Erro ao buscar reviews:", err);
            return res.status(500).json({ error: "Erro ao buscar as reviews" });
        }
        res.json(results);
    });
});

app.post('/games/:id/reviews', (req, res) => {
    const { id } = req.params;
    const { texto, username, tipo } = req.body;

    if (!texto || !username) {
        return res.status(400).json({ error: "Conteúdo inválido ou usuário deslogado." });
    }

    const tipoFinal = tipo === 'negativa' ? 'negativa' : 'positiva';

    const sql = "INSERT INTO reviews (game_id, user_id, texto, tipo) VALUES (?, (SELECT id FROM users WHERE username = ?), ?, ?)";

    db.query(sql, [id, username, texto, tipoFinal], (err, result) => {
        if (err) {
            console.error("Erro ao salvar review:", err);
            return res.status(500).json({ error: "Erro ao publicar a sua review" });
        }
        res.status(201).json({ message: "Review publicada com sucesso!" });
    });
});

app.delete('/reviews/:id', (req, res) => {
    const { id } = req.params;
    const { requesterRole } = req.body;

    if (requesterRole !== 'admin' && requesterRole !== 'curator') {
        return res.status(403).json({ error: "Sem permissão para excluir comentários" });
    }

    const sql = "DELETE FROM reviews WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Erro ao excluir review:", err);
            return res.status(500).json({ error: "Erro ao excluir o comentário" });
        }
        res.json({ message: "Comentário excluído" });
    });
});

app.get('/noticias', (req, res) => {
    const { categoria } = req.query;
    let sql = "SELECT * FROM noticias ORDER BY data_post DESC";
    let params = [];

    if (categoria && categoria !== 'tudo') {
        sql = "SELECT * FROM noticias WHERE categoria = ? ORDER BY data_post DESC";
        params = [categoria];
    }

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Erro ao buscar as notícias" });
        }
        res.json(results);
    });
});

app.post('/noticias', (req, res) => {
    const { titulo, imagem_url, categoria } = req.body;

    if (!titulo || !imagem_url || !categoria) {
        return res.status(400).json({ error: "Preencha todos os campos da notícia" });
    }

    const sql = "INSERT INTO noticias (titulo, imagem_url, categoria) VALUES (?, ?, ?)";

    db.query(sql, [titulo, imagem_url, categoria], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Erro ao publicar notícia" });
        }
        res.status(201).json({ message: "Notícia publicada com sucesso", id: result.insertId });
    });
});

app.get('/users/:username', (req, res) => {
    const { username } = req.params;
    const sql = "SELECT id, username, email, bio, avatar_url, membro_desde, role FROM users WHERE username = ?";

    db.query(sql, [username], (err, results) => {
        if (err) {
            console.error("Erro ao buscar usuário:", err);
            return res.status(500).json({ error: "Erro no banco de dados" });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }
        res.json(results[0]);
    });
});

app.get('/users/:username/reviews', (req, res) => {
    const { username } = req.params;
    const sql = "SELECT reviews.id, reviews.texto, reviews.tipo, reviews.data_coment, reviews.game_id, games.titulo AS game_titulo FROM reviews JOIN users ON reviews.user_id = users.id JOIN games ON reviews.game_id = games.id WHERE users.username = ? ORDER BY reviews.data_coment DESC";

    db.query(sql, [username], (err, results) => {
        if (err) {
            console.error("Erro ao buscar reviews do usuário:", err);
            return res.status(500).json({ error: "Erro ao buscar as reviews do usuário" });
        }
        res.json(results);
    });
});

app.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    const { requesterRole } = req.body;

    if (requesterRole !== 'admin') {
        return res.status(403).json({ error: "Apenas administradores podem excluir usuários" });
    }

    const sql = "DELETE FROM users WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Erro ao excluir usuário:", err);
            return res.status(500).json({ error: "Erro ao excluir o usuário" });
        }
        res.json({ message: "Usuário excluído" });
    });
});

app.get('/users/:username/favoritos', (req, res) => {
    const { username } = req.params;
    const sql = "SELECT games.* FROM favoritos JOIN games ON favoritos.game_id = games.id JOIN users ON favoritos.user_id = users.id WHERE users.username = ? ORDER BY favoritos.id DESC";

    db.query(sql, [username], (err, results) => {
        if (err) {
            console.error("Erro ao buscar favoritos:", err);
            return res.status(500).json({ error: "Erro ao buscar os favoritos" });
        }
        res.json(results);
    });
});

app.post('/favoritos', (req, res) => {
    const { username, game_id } = req.body;

    if (!username || !game_id) {
        return res.status(400).json({ error: "Dados inválidos" });
    }

    const findUser = "SELECT id FROM users WHERE username = ?";
    db.query(findUser, [username], (err, users) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Erro no banco de dados" });
        }
        if (users.length === 0) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }
        const userId = users[0].id;

        const check = "SELECT id FROM favoritos WHERE user_id = ? AND game_id = ?";
        db.query(check, [userId, game_id], (err2, rows) => {
            if (err2) {
                console.error(err2);
                return res.status(500).json({ error: "Erro no banco de dados" });
            }
            if (rows.length > 0) {
                return res.json({ message: "Jogo já estava nos favoritos" });
            }

            const sql = "INSERT INTO favoritos (user_id, game_id) VALUES (?, ?)";
            db.query(sql, [userId, game_id], (err3) => {
                if (err3) {
                    console.error(err3);
                    return res.status(500).json({ error: "Erro ao favoritar o jogo" });
                }
                res.status(201).json({ message: "Jogo favoritado" });
            });
        });
    });
});

app.delete('/favoritos', (req, res) => {
    const { username, game_id } = req.body;

    if (!username || !game_id) {
        return res.status(400).json({ error: "Dados inválidos" });
    }

    const sql = "DELETE FROM favoritos WHERE game_id = ? AND user_id = (SELECT id FROM users WHERE username = ?)";

    db.query(sql, [game_id, username], (err) => {
        if (err) {
            console.error("Erro ao remover favorito:", err);
            return res.status(500).json({ error: "Erro ao remover o favorito" });
        }
        res.json({ message: "Favorito removido" });
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Ta rodando na porta ${PORT}`);
});