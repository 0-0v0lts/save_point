import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { getStoredUser, isStaff } from '../utils/auth';
import '../styles/Detalhes.css';

const Detalhes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState('');
  const [reviewType, setReviewType] = useState('positiva');
  const [reviewError, setReviewError] = useState('');

  const { username, role } = getStoredUser();
  const staff = isStaff(role);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/games/${id}/reviews`);
      setReviews(res.data);
    } catch (err) {
      console.error("Erro ao buscar reviews:", err);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        const resLocal = await axios.get(`http://localhost:3001/games/${id}`);
        const localData = resLocal.data;

        if (localData.descricao && localData.descricao.trim()) {
          setGame({ ...localData, sobre: localData.descricao });
          await fetchReviews();
          return;
        }
        const RAWG_KEY = 'a270cb5741884441adca87b8298d3c1b';
        const resRawg = await axios.get(
          `https://api.rawg.io/api/games?key=${RAWG_KEY}&search=${localData.titulo}`
        );

        let extraData = { sobre: "Descrição não encontrada." };

        if (resRawg.data.results.length > 0) {
          const gameSlug = resRawg.data.results[0].slug;
          const resDesc = await axios.get(
            `https://api.rawg.io/api/games/${gameSlug}?key=${RAWG_KEY}`
          );

          const textoOriginal = resDesc.data.description_raw;

          try {
            const resTranslate = await axios.get(
              `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textoOriginal.substring(0, 500))}&langpair=en|pt-BR`
            );
            extraData.sobre = resTranslate.data.responseData.translatedText;
          } catch (err) {
            extraData.sobre = textoOriginal;
          }
        }

        setGame({ ...localData, ...extraData });
        await fetchReviews();
      } catch (error) {
        console.error("Erro:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');

    if (!newReview.trim()) return;

    if (!username) {
      setReviewError('Você precisa estar logado para deixar uma review.');
      return;
    }

    try {
      await axios.post(`http://localhost:3001/games/${id}/reviews`, {
        texto: newReview,
        username: username,
        tipo: reviewType
      });

      setNewReview('');
      setReviewType('positiva');
      fetchReviews();
    } catch (err) {
      setReviewError('Erro ao publicar review. Tente novamente.');
      console.error(err);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Excluir este comentário?')) return;
    try {

      await axios.delete(`http://localhost:3001/reviews/${reviewId}`, {
        data: { requesterRole: role }
      });
      fetchReviews();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Não foi possível excluir o comentário.');
    }
  };

  if (loading) return <div className="loading-screen">Carregando Detalhes...</div>;
  if (!game) return <div className="error-screen">Jogo não encontrado.</div>;

  return (
    <div className="details-page">
      <div
        className="hero-banner"
        style={{ backgroundImage: `url(http://localhost:3001/games/${id}/imagem)` }}
      >
        <div className="hero-overlay"></div>
      </div>

      <div className="details-content">
        <button className="back-link" onClick={() => navigate('/')}>
          ← VOLTAR PARA A BIBLIOTECA
        </button>

        <header className="details-header">
          <div className="header-meta">
            <span className="year-tag">{game.ano_lanc}</span>
            <span className="platform-tag">{game.plataforma}</span>
          </div>
          <h1>{game.titulo}</h1>
        </header>

        <main className="details-main-grid">
          <section className="about-section">
            <h2>Sobre</h2>
            <p>{game.sobre || "Nenhuma descrição disponível para este título em português."}</p>
          </section>

          <aside className="stats-aside">
            <div className="stat-card">
              <span className="label">Investimento</span>
              <span className="value">R$ {game.preco}</span>
            </div>
            <div className="stat-card">
              <span className="label">Conquista</span>
              <span className="value">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/3112/3112946.png"
                  alt="trofeu"
                  style={{ width: '20px', height: '18px', filter: 'brightness(0) invert(1)', marginRight: '2px' }}
                />
                {game.trofeus} Troféus
              </span>
            </div>
            <div className="stat-card">
              <span className="label">Gênero</span>
              <span className="value">{game.genero}</span>
            </div>
          </aside>
        </main>

        <section className="reviews-section">
          <h2>Reviews da Comunidade</h2>

          {username ? (
            <form onSubmit={handleReviewSubmit} className="review-form">
              <textarea
                placeholder="Escreva sua review sobre o jogo..."
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                maxLength={1000}
                required
              />
              <div className="review-type-selector">
                <span className="selector-label">Sua análise:</span>
                <button
                  type="button"
                  className={`type-btn ${reviewType === 'positiva' ? 'active-positive' : ''}`}
                  onClick={() => setReviewType('positiva')}
                >
                  👍 Positiva
                </button>
                <button
                  type="button"
                  className={`type-btn ${reviewType === 'negativa' ? 'active-negative' : ''}`}
                  onClick={() => setReviewType('negativa')}
                >
                  👎 Negativa
                </button>
              </div>
              {reviewError && <p className="review-error-msg">{reviewError}</p>}
              <button type="submit" className="submit-review-btn">Publicar Review</button>
            </form>
          ) : (
            <p className="login-warning-box">Faça login para deixar sua review nesta save point.</p>
          )}

          <div className="reviews-list">
            {reviews.length === 0 ? (
              <p className="no-reviews">Seja o primeiro a deixar uma review para este jogo!</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-card-header">
                    <div className="review-author-group">
                      <Link to={`/perfil/${review.username}`} className="review-author">@{review.username}</Link>
                      <span className={`review-type-badge ${review.tipo === 'negativa' ? 'negative' : 'positive'}`}>
                        {review.tipo === 'negativa' ? '👎 Não recomenda' : '👍 Recomenda'}
                      </span>
                    </div>
                    <div className="review-meta">
                      <span className="review-date">
                        {new Date(review.data_coment).toLocaleDateString('pt-BR')}
                      </span>
                      {staff && (
                        <button
                          className="delete-review-btn"
                          onClick={() => handleDeleteReview(review.id)}
                          title="Excluir comentário"
                        >
                          Excluir
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="review-text">{review.texto}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Detalhes;