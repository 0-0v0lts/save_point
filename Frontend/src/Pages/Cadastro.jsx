import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import '../styles/Cadastro.css'

const Cadastro = ({ fetchGames }) => {
  const [titulo, setTitulo] = useState('')
  const [genero, setGenero] = useState('')
  const [plataforma, setPlataforma] = useState('')
  const [ano_lanc, setAnoLanc] = useState('')
  const [preco, setPreco] = useState('')
  const [trofeus, setTrofeus] = useState('')
  const [url_imagem, setUrlImagem] = useState('')
  const [descricao, setDescricao] = useState('')
  const [cadastrando, setCadastrando] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCadastrando(true)
    try {
      await axios.post('http://localhost:3001/games', {
        titulo,
        genero,
        plataforma,
        ano_lanc,
        preco,
        trofeus,
        url_imagem,
        descricao
      })

      setTitulo(''); setGenero(''); setAnoLanc(''); setPlataforma(''); setPreco(''); setTrofeus(''); setUrlImagem(''); setDescricao('');

      fetchGames()
      navigate('/')
    } catch (error) {
      console.error("não cadastrou:", error)
      alert("erro salvando no banco de dados")
    } finally {
      setCadastrando(false)
    }
  }

  return (
    <div className = 'cadastro-page'>
      <div className = 'cadastro-card'>
        <h3 style={{ color: 'white' }}>Cadastrar Jogo</h3>
        <form onSubmit={handleSubmit} className = 'cadastro-form'>
          <input
            name="titulo"
            placeholder="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
          />
          <input
            name='genero'
            placeholder="Gênero"
            value={genero}
            onChange={(e) => setGenero(e.target.value)}
            required
          />
          <input
            name='plataforma'
            placeholder="Plataforma"
            value={plataforma}
            onChange={(e) => setPlataforma(e.target.value)}
            required
          />
          <input
            name='ano'
            placeholder="Ano"
            type="number"
            value={ano_lanc}
            onChange={(e) => setAnoLanc(e.target.value)}
            required
          />
          <input
            name='preco'
            placeholder="Preço"
            type="number"
            step="0.01"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            required
          />
          <input
            name='trofeus'
            placeholder="Troféus"
            type="number"
            value={trofeus}
            onChange={(e) => setTrofeus(e.target.value)}
            required
          />
          <input
            name='url_imagem'
            placeholder="URL da imagem (capa do jogo)"
            value={url_imagem}
            onChange={(e) => setUrlImagem(e.target.value)}
          />
          <textarea
            name='descricao'
            placeholder="Descrição / sobre o jogo (opcional)"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows={4}
          />
          <div className = 'form-actions'>
            <button className = 'btn-save' type="submit" disabled={cadastrando}>
              {cadastrando ? 'Cadastrando e buscando capa...' : 'Salvar'}
            </button>
            <button className = 'btn-back' type="button" onClick={() => navigate('/')} disabled={cadastrando}>Voltar para a Lista</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Cadastro