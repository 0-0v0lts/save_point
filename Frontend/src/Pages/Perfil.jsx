import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import mascote from '../assets/Group 1.svg';
import Gameimagem from '../components/GameImagem';
import { getStoredUser, isAdmin, isStaff } from '../utils/auth';
import '../styles/Perfil.css';

const Perfil = () => {
  const { username } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const current = getStoredUser();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setNotFound(false);
        const resUser = await axios.get(`http://localhost:3001/users/${username}`);
        setUser(resUser.data);
        const resReviews = await axios.get(`http://localhost:3001/users/${username}/reviews`);
        setReviews(resReviews.data);
        const resFavoritos = await axios.get(`http://localhost:3001/users/${username}/favoritos`);
        setFavoritos(resFavoritos.data);
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
        if (err.response && err.response.status === 404) setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  const handleDeleteUser = async () => {
    if (!window.confirm(`Excluir o usuário @${user.username}? Esta ação é permanente e remove também todas as reviews dele.`)) return;
    try {
      // axios.delete envia o corpo dentro de "data"
      await axios.delete(`http://localhost:3001/users/${user.id}`, {
        data: { requesterRole: current.role }
      });
      alert('Usuário excluído com sucesso.');
      navigate('/');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Não foi possível excluir o usuário.');
    }
  };

  if (loading) return <div className="perfil-loading">Carregando perfil...</div>;

  if (notFound || !user) {
    return (
      <div className="perfil-erro">
        <h2>Usuário não encontrado</h2>
        <button onClick={() => navigate('/')} className="perfil-voltar">← Voltar para a biblioteca</button>
      </div>
    );
  }

  const initials = user.username.substring(0, 2).toUpperCase();
  const roleLabel =
    user.role === 'admin' ? 'Administrador' :
    user.role === 'curator' ? 'Curador' : 'Membro';

  const isOwnProfile = current.username === user.username;
  const canDelete = isAdmin(current.role) && !isOwnProfile;

  return (
    <div className="perfil-page">
      <button onClick={() => navigate(-1)} className="perfil-voltar">← VOLTAR</button>

      <div className="perfil-card">
        <div className="perfil-avatar">
          {user.avatar_url ? <img src={user.avatar_url} alt={user.username} /> : initials}
        </div>

        <div className="perfil-info">
          <div className="perfil-nome-linha">
            <h1>{user.username}</h1>
            {isStaff(user.role) && <img src={mascote} className="perfil-badge" alt="Selo" />}
          </div>

          <span className={`perfil-role-tag role-${user.role}`}>{roleLabel}</span>

          <p className="perfil-bio">{user.bio || 'Este usuário ainda não escreveu uma bio.'}</p>

          <div className="perfil-meta">
            <span>📧 {user.email}</span>
            <span>📅 Membro desde {user.membro_desde}</span>
            <span>📝 {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span>
          </div>

          {canDelete && (
            <button className="perfil-excluir-btn" onClick={handleDeleteUser}>
              Excluir Usuário
            </button>
          )}
        </div>
      </div>

      <section className="perfil-favoritos">
        <h2>Jogos favoritos</h2>
        {favoritos.length === 0 ? (
          <p className="perfil-sem-reviews">Nenhum jogo favoritado ainda.</p>
        ) : (
          <div className="perfil-favoritos-grid">
            {favoritos.map((game) => (
              <Link key={game.id} to={`/detalhes/${game.id}`} className="fav-mini-card">
                <div className="fav-mini-cover">
                  <Gameimagem title={game.titulo} />
                </div>
                <div className="fav-mini-info">
                  <span className="fav-mini-title">{game.titulo}</span>
                  <span className="fav-mini-meta">{game.genero}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="perfil-reviews">
        <h2>Reviews de {user.username}</h2>

        {reviews.length === 0 ? (
          <p className="perfil-sem-reviews">Nenhuma review publicada ainda.</p>
        ) : (
          <div className="perfil-reviews-list">
            {reviews.map((review) => (
              <div key={review.id} className="perfil-review-card">
                <div className="perfil-review-top">
                  <Link to={`/detalhes/${review.game_id}`} className="perfil-review-game">
                    {review.game_titulo}
                  </Link>
                  <span className={`review-type-badge ${review.tipo === 'negativa' ? 'negative' : 'positive'}`}>
                    {review.tipo === 'negativa' ? '👎 Não recomenda' : '👍 Recomenda'}
                  </span>
                </div>
                <p className="perfil-review-text">{review.texto}</p>
                <span className="perfil-review-date">
                  {new Date(review.data_coment).toLocaleDateString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Perfil;
