// ============================================================
// Script de backfill de DESCRIÇÕES (rodar UMA vez)
// ------------------------------------------------------------
// Busca o "sobre" de cada jogo na RAWG, traduz (igual a página de
// detalhes faz) e SALVA no banco (coluna games.descricao). Depois
// disso a página de detalhes lê do banco e abre instantâneo, sem
// chamar a RAWG nem traduzir ao vivo.
//
// Pré-requisitos:
//   1) Rodar a migração:  Database/migration_descricao.sql
//   2) No .env (pasta Backend): DB_* já configurados + RAWG_KEY
//
// Como rodar (DENTRO da pasta Backend):
//   node scripts/backfill-descricoes.js
//
// Requer Node 18+ (fetch nativo). Seguro rodar de novo: só processa
// os jogos que ainda estão sem descrição.
// ============================================================

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const db = require('../config/db');

const RAWG_KEY = process.env.RAWG_KEY;

function query(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => (err ? reject(err) : resolve(result)));
  });
}

// Busca na RAWG e retorna o texto do "sobre" (em inglês)
async function buscarSobreNaRawg(titulo) {
  const busca = await fetch(`https://api.rawg.io/api/games?key=${RAWG_KEY}&search=${encodeURIComponent(titulo)}`);
  if (!busca.ok) throw new Error(`RAWG busca respondeu ${busca.status}`);
  const dadosBusca = await busca.json();
  if (!dadosBusca.results || dadosBusca.results.length === 0) return null;

  const slug = dadosBusca.results[0].slug;
  const detalhe = await fetch(`https://api.rawg.io/api/games/${slug}?key=${RAWG_KEY}`);
  if (!detalhe.ok) throw new Error(`RAWG detalhe respondeu ${detalhe.status}`);
  const dadosDetalhe = await detalhe.json();

  return dadosDetalhe.description_raw || null;
}

// Traduz os primeiros 500 caracteres (igual à página de detalhes).
// Se a tradução falhar, devolve o texto original em inglês.
async function traduzir(textoOriginal) {
  const trecho = textoOriginal.substring(0, 500);
  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(trecho)}&langpair=en|pt-BR`);
    if (!res.ok) throw new Error(`MyMemory respondeu ${res.status}`);
    const dados = await res.json();
    return dados.responseData.translatedText || trecho;
  } catch (e) {
    return trecho; // fallback: inglês
  }
}

(async () => {
  if (!RAWG_KEY) {
    console.error("❌ Faltando RAWG_KEY no .env. Adicione: RAWG_KEY=a270cb5741884441adca87b8298d3c1b");
    process.exit(1);
  }

  try {
    const games = await query("SELECT id, titulo FROM games WHERE descricao IS NULL OR descricao = ''");
    console.log(`Encontrados ${games.length} jogos sem descrição. Buscando na RAWG...\n`);

    let salvos = 0;
    let falharam = 0;

    for (const game of games) {
      try {
        const sobreOriginal = await buscarSobreNaRawg(game.titulo);
        if (!sobreOriginal) {
          console.log(`- ${game.titulo} (RAWG não retornou descrição)`);
          falharam++;
          continue;
        }

        const sobreTraduzido = await traduzir(sobreOriginal);
        await query("UPDATE games SET descricao = ? WHERE id = ?", [sobreTraduzido, game.id]);

        console.log(`✓ ${game.titulo}`);
        salvos++;
      } catch (e) {
        console.log(`✗ ${game.titulo}: ${e.message}`);
        falharam++;
      }

      // pausa entre jogos (RAWG + MyMemory têm limites)
      await new Promise((r) => setTimeout(r, 500));
    }

    console.log(`\nConcluído: ${salvos} descrições salvas no banco, ${falharam} falharam.`);
    console.log("Agora a página de detalhes carrega o 'sobre' direto do banco. 🎉");
  } catch (e) {
    console.error("Erro no backfill:", e);
  } finally {
    db.end();
  }
})();
