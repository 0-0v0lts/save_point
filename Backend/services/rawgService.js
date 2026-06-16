const TIMEOUT = 8000;

function rawgKey() {
  return process.env.RAWG_KEY;
}

async function buscarUrlImagem(titulo) {
  const url = `https://api.rawg.io/api/games?key=${rawgKey()}&search=${encodeURIComponent(titulo)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT) });
  if (!res.ok) throw new Error(`RAWG busca respondeu ${res.status}`);
  const data = await res.json();
  if (data.results && data.results.length > 0) {
    return data.results[0].background_image || null;
  }
  return null;
}

async function baixarImagem(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT) });
  if (!res.ok) throw new Error(`download respondeu ${res.status}`);
  const mime = res.headers.get('content-type') || 'image/jpeg';
  const buffer = Buffer.from(await res.arrayBuffer());
  return { mime, buffer };
}

async function buscarSobreTraduzido(titulo) {
  const busca = await fetch(
    `https://api.rawg.io/api/games?key=${rawgKey()}&search=${encodeURIComponent(titulo)}`,
    { signal: AbortSignal.timeout(TIMEOUT) }
  );
  if (!busca.ok) throw new Error(`RAWG busca respondeu ${busca.status}`);
  const dadosBusca = await busca.json();
  if (!dadosBusca.results || dadosBusca.results.length === 0) return null;

  const slug = dadosBusca.results[0].slug;
  const detalhe = await fetch(
    `https://api.rawg.io/api/games/${slug}?key=${rawgKey()}`,
    { signal: AbortSignal.timeout(TIMEOUT) }
  );
  if (!detalhe.ok) throw new Error(`RAWG detalhe respondeu ${detalhe.status}`);
  const dadosDetalhe = await detalhe.json();

  const original = dadosDetalhe.description_raw;
  if (!original) return null;

  const trecho = original.substring(0, 500);
  try {
    const t = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trecho)}&langpair=en|pt-BR`,
      { signal: AbortSignal.timeout(TIMEOUT) }
    );
    if (!t.ok) throw new Error('tradução falhou');
    const dadosT = await t.json();
    return dadosT.responseData.translatedText || trecho;
  } catch (e) {
    return trecho;
  }
}

module.exports = { buscarUrlImagem, baixarImagem, buscarSobreTraduzido };
