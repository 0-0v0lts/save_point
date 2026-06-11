import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import '../styles/Login.css';

export default function RegistroUsuario() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (username.trim() === '' || email.trim() === '' || password.trim() === '') {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao criar conta.');
        return;
      }

      setSuccess('Conta criada com sucesso! Redirecionando para o login...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);

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
        <p>Crie sua conta para avaliar e organizar seus jogos</p>

        {error && <div style={{ color: '#d9534f', marginBottom: '15px', fontSize: '14px' }}>{error}</div>}
        {success && <div style={{ color: '#39ff14', marginBottom: '15px', fontSize: '14px' }}>{success}</div>}

        <form className="login-form" onSubmit={handleRegister}>
          <label htmlFor="username">Nome de usuário</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Escolha um nome de usuário"
            required
          />

          <label htmlFor="email">E-mail</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Digite seu e-mail"
            required
          />

          <label htmlFor="password">Senha</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Crie uma senha"
            required
          />

          <label htmlFor="confirmPassword">Confirmar senha</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repita a senha"
            required
          />

          <button type="submit" className="btn-login">
            Criar conta
          </button>
        </form>

        <div className="login-footer">
          Já tem uma conta? <a href="/login">Fazer login</a>
        </div>
      </div>
    </div>
  );
}
