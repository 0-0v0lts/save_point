const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const db = require('../config/db');

const RAWG_KEY = process.env.RAWG_KEY;

function query(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => (err ? reject(err) : resolve(result)));
  });
}

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

async function traduzir(textoOriginal) {
  const trecho = textoOriginal.substring(0, 500);
  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(trecho)}&langpair=en|pt-BR`);
    if (!res.ok) throw new Error(`MyMemory respondeu ${res.status}`);
    const dados = await res.json();
    return dados.responseData.translatedText || trecho;
  } catch (e) {
    return trecho;
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
