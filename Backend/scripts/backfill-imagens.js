// ============================================================
// Script de backfill de IMAGENS (rodar UMA vez)
// ------------------------------------------------------------
// Baixa a capa de cada jogo da RAWG e SALVA OS BYTES no seu banco
// (tabela game_imagens). Depois disso o app serve as imagens do
// próprio banco e NÃO depende mais da RAWG para exibir nada.
//
// Pré-requisitos:
//   1) Rodar a migração:  Database/migration_imagens_blob.sql
//   2) No .env (pasta Backend):
//        DB_HOST, DB_USER, DB_PASSWORD, DB_NAME  (já configurados)
//        RAWG_KEY=a270cb5741884441adca87b8298d3c1b
//
// Como rodar (dentro da pasta Backend):
//   node scripts/backfill-imagens.js
//
// Requer Node 18+ (usa fetch nativo). É seguro rodar de novo:
// só baixa os jogos que ainda não têm imagem salva.
// ============================================================

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const db = require('../config/db');

const RAWG_KEY = process.env.RAWG_KEY;

// Promisify simples do db.query (o driver é baseado em callback)
function query(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => (err ? reject(err) : resolve(result)));
  });
}

// Busca a URL da capa na RAWG pelo título
async function buscarUrlNaRawg(titulo) {
  const url = `https://api.rawg.io/api/games?key=${RAWG_KEY}&search=${encodeURIComponent(titulo)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`RAWG API respondeu ${res.status}`);
  const data = await res.json();
  if (data.results && data.results.length > 0) {
    return data.results[0].background_image || null;
  }
  return null;
}

// Baixa os bytes da imagem a partir de uma URL
async function baixarImagem(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download respondeu ${res.status}`);
  const mime = res.headers.get('content-type') || 'image/jpeg';
  const buffer = Buffer.from(await res.arrayBuffer());
  return { mime, buffer };
}

(async () => {
  if (!RAWG_KEY) {
    console.error("❌ Faltando RAWG_KEY no .env. Adicione: RAWG_KEY=a270cb5741884441adca87b8298d3c1b");
    process.exit(1);
  }

  try {
    // Jogos que ainda NÃO têm imagem salva no banco
    const games = await query(
      `SELECT g.id, g.titulo, g.url_imagem
         FROM games g
         LEFT JOIN game_imagens gi ON gi.game_id = g.id
        WHERE gi.game_id IS NULL`
    );

    console.log(`Encontrados ${games.length} jogos sem imagem salva. Baixando da RAWG...\n`);

    let salvos = 0;
    let falharam = 0;

    for (const game of games) {
      try {
        // Usa a url_imagem se já existir; senão, busca na RAWG pelo título
        let url = game.url_imagem;
        if (!url) url = await buscarUrlNaRawg(game.titulo);

        if (!url) {
          console.log(`- ${game.titulo} (RAWG não retornou capa)`);
          falharam++;
          continue;
        }

        const { mime, buffer } = await baixarImagem(url);

        // Salva os bytes no banco (insere ou atualiza)
        await query(
          `INSERT INTO game_imagens (game_id, mime, dados) VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE mime = VALUES(mime), dados = VALUES(dados)`,
          [game.id, mime, buffer]
        );

        // Guarda também a url_imagem como referência, se ainda não tinha
        if (!game.url_imagem) {
          await query("UPDATE games SET url_imagem = ? WHERE id = ?", [url, game.id]);
        }

        console.log(`✓ ${game.titulo} (${(buffer.length / 1024).toFixed(0)} KB)`);
        salvos++;
      } catch (e) {
        console.log(`✗ ${game.titulo}: ${e.message}`);
        falharam++;
      }

      // pausa educada entre chamadas pra não estourar limite da RAWG
      await new Promise((r) => setTimeout(r, 300));
    }

    console.log(`\nConcluído: ${salvos} imagens salvas no banco, ${falharam} falharam.`);
    console.log("Agora as capas são servidas direto do seu banco. 🎉");
  } catch (e) {
    console.error("Erro no backfill:", e);
  } finally {
    db.end();
  }
})();
