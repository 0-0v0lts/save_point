import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import mascote from '../assets/Group 1.svg';
import { getStoredUser, isStaff } from '../utils/auth';
import '../styles/Header.css';

const Header = () => {
    const { username, role } = getStoredUser();
    const displayName = username || 'Usuário';
    const initials = displayName.substring(0, 2).toUpperCase();
    const staff = isStaff(role);

    const handleLogout = () => {
        localStorage.removeItem('user_role');
        localStorage.removeItem('username');
        window.location.href = '/login';
    };

    return (
        <header className="main-header">
            <div className="header-left">
                <Link to="/" className="logo-container">
                    <img src={logo} alt="Save Point Logo" className="header-logo-icon" />
                    <span className="logo-text">SAVE<span>POINT</span></span>
                </Link>
            </div>

            <div className="header-right">
                {staff && (
                    <Link to="/cadastrar" className="add-button">
                        Cadastrar
                    </Link>
                )}
                <Link to="/noticias" className="news-button">
                    Notícias
                </Link>
                <Link to={`/perfil/${displayName}`} className="user-profile">
                    <div className="avatar">{initials}</div>
                    <span className="user-name">
                        {displayName}
                        {staff && (
                            <img src={mascote} className="role-badge" alt="Selo de curador/admin" />
                        )}
                    </span>
                </Link>
                <button onClick={handleLogout} className="btn-logout">
                    Sair
                </button>
            </div>
        </header>
    );
}

export default Header;
