import React, { useState } from 'react';
import logo from '../assets/logo.png';
import '../styles/Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (email.trim() === '' || password.trim() === '') {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Usuário ou senha inválidos.');
        return;
      }

      localStorage.setItem('user_role', data.role);
      localStorage.setItem('username', data.username);
      window.location.href = '/';

    } catch (err) {
      setError('Erro ao conectar com o servidor.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo-container">
          <img src={logo} alt="Save Point Logo" className="login-logo-icon" />
          <h2>SAVE<span>POINT</span></h2>
        </div>
        <p>Acesse sua conta para avaliar e organizar seus jogos</p>

        {error && <div style={{ color: '#d9534f', marginBottom: '15px', fontSize: '14px' }}>{error}</div>}

        <form className="login-form" onSubmit={handleLogin}>
          <label htmlFor="email">E-mail ou Username</label>
          <input
            type="text"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Digite seu e-mail ou usuário"
            required
          />

          <label htmlFor="password">Senha</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite sua senha"
            required
          />

          <button type="submit" className="btn-login">
            Entrar
          </button>
        </form>

        <div className="login-footer">
          Não tem uma conta? <a href="/cadastro">Criar conta</a>
        </div>
      </div>
    </div>
  );
}