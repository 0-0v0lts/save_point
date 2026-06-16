import { useState, useEffect } from 'react'
import axios from 'axios'
import Gameimagem from '../components/GameImagem'
import { useNavigate } from 'react-router-dom'
import { getStoredUser, isStaff } from '../utils/auth'

const Home = ({ games, fetchGames, currentPage, setCurrentPage, totalPages }) => {
  const [estaEditando, setEstaEditando] = useState(false)
  const [jogoEscolhido, setJogoEscolhido] = useState(null)
  const [favoritedIds, setFavoritedIds] = useState(new Set())

  const { username, role } = getStoredUser()
  const staff = isStaff(role)

  const navigate = useNavigate()

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!username) return
      try {
        const res = await axios.get(`http://localhost:3001/users/${username}/favoritos`)
        setFavoritedIds(new Set(res.data.map((g) => g.id)))
      } catch (err) {
        console.error("Erro ao carregar favoritos:", err)
      }
    }
    fetchFavorites()
  }, [username])

  const toggleFavorite = async (e, gameId) => {
    e.stopPropagation()
    if (!username) return

    const isFav = favoritedIds.has(gameId)
    try {
      if (isFav) {
        await axios.delete('http://localhost:3001/favoritos', {
          data: { username, game_id: gameId }
        })
      } else {
        await axios.post('http://localhost:3001/favoritos', {
          username,
          game_id: gameId
        })
      }

      setFavoritedIds((prev) => {
        const next = new Set(prev)
        if (isFav) next.delete(gameId)
        else next.add(gameId)
        return next
      })
    } catch (err) {
      console.error("Erro ao favoritar:", err)
    }
  }

  const openEditModal = (e, game) => {
    e.stopPropagation()
    setJogoEscolhido(game)
    setEstaEditando(true)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try{
      await axios.put(`http://localhost:3001/games/${jogoEscolhido.id}`, jogoEscolhido)
      setEstaEditando(false)
      fetchGames()
      alert("jogo atualizado")
    }catch (err) {
      alert("não atualizou")
    }
  }

  const deleteGame = async (e, id) => {
    e.stopPropagation()
    if (window.confirm("Remover?")) {
      try {
        await axios.delete(`http://localhost:3001/games/${id}`)
        fetchGames()
      } catch (err) { alert('não deletou')}
    }
  }

  return (
    <div className="home-content">
      <h2>Lista de Jogos</h2>
      <div className = 'game-grid'>
        {games.length > 0 ? (
          games.map((game) => (
            <div key={game.id} className="game-card" onClick = {() => navigate(`/detalhes/${game.id}`)}>
              <Gameimagem id = {game.id} title = {game.titulo} />
              <button
                className={`fav-button ${favoritedIds.has(game.id) ? 'favorited' : ''}`}
                onClick={(e) => toggleFavorite(e, game.id)}
                title={favoritedIds.has(game.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              >
                {favoritedIds.has(game.id) ? '♥' : '♡'}
              </button>
              <div className='info-game'>
                <div className = 'top-badges'>
                  <span className = "badge genre-badge">{game.genero}</span>
                  <span className = 'badge trophy-badge'>
                    <img
                    src="https://cdn-icons-png.flaticon.com/512/3112/3112946.png"
                    alt="trofeu"
                    style={{ width: '10px', height: '10px', filter: 'brightness(0) invert(1)', marginRight: '2px' }}
                  />
                  {game.trofeus}</span>
                </div>
                <h3 className = 'game-title'>{game.titulo}</h3>

                <div className='hover-detail'>
                  <div className = 'badge-row'>
                    <span className = 'badge platform-badge'>{game.plataforma}</span>
                    <span className = 'badge year-badge'>{game.ano_lanc}</span>
                    <span className='badge price-tag'>R$ {game.preco}</span>
                  </div>
                  {staff && (
                    <div className = 'action-buttons'>
                      <button onClick={(e) => openEditModal(e, game)} className = 'button-edit'>Editar</button>
                      <button onClick={(e) => deleteGame(e, game.id)} className = "button-delete">Remover</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>Carregando os jogos ou nenhum foi encontrado...</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn-pag"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            « Anterior
          </button>

          <span className="pag-info">Página <strong>{currentPage}</strong> de {totalPages}</span>

          <button
            className="btn-pag"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Próximo »
          </button>
        </div>
      )}

      {estaEditando && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Editar Jogo</h3>
            <form onSubmit={handleUpdate}>
              <input
                placeholder="Título"
                value={jogoEscolhido.titulo}
                onChange={(e) => setJogoEscolhido({...jogoEscolhido, titulo: e.target.value})}
                required
              />
              <input
                placeholder="Gênero"
                value={jogoEscolhido.genero}
                onChange={(e) => setJogoEscolhido({...jogoEscolhido, genero: e.target.value})}
                required
              />
              <input
                placeholder="Plataforma"
                value={jogoEscolhido.plataforma}
                onChange={(e) => setJogoEscolhido({...jogoEscolhido, plataforma: e.target.value})}
                required
              />
              <input
                placeholder="URL da imagem (capa do jogo)"
                value={jogoEscolhido.url_imagem || ''}
                onChange={(e) => setJogoEscolhido({...jogoEscolhido, url_imagem: e.target.value})}
              />
              <textarea
                placeholder="Descrição / sobre o jogo"
                value={jogoEscolhido.descricao || ''}
                onChange={(e) => setJogoEscolhido({...jogoEscolhido, descricao: e.target.value})}
                rows={4}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="number"
                  placeholder="Ano"
                  value={jogoEscolhido.ano_lanc}
                  onChange={(e) => setJogoEscolhido({...jogoEscolhido, ano_lanc: e.target.value})}
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Preço"
                  value={jogoEscolhido.preco}
                  onChange={(e) => setJogoEscolhido({...jogoEscolhido, preco: e.target.value})}
                  required
                />
                <input
                  type="number"
                  placeholder="Troféus"
                  value={jogoEscolhido.trofeus}
                  onChange={(e) => setJogoEscolhido({...jogoEscolhido, trofeus: e.target.value})}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-save">Salvar</button>
                <button type="button" className="btn-cancel" onClick={() => setEstaEditando(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home