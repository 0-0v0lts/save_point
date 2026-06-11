import { useState, useEffect } from 'react'
import axios from 'axios'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Home from './Pages/Home'
import Cadastro from './Pages/Cadastro'
import Detalhes from './Pages/Detalhes'
import Login from './Pages/Login'
import Noticias from './Pages/Noticias'
import Perfil from './Pages/Perfil'
import RegistroUsuario from './Pages/RegistroUsuario'
import { isStaff } from './utils/auth'
import './styles/App.css'

function App() {
  const [games, setGames] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const isAuthenticated = !!localStorage.getItem('user_role')
  const userRole = localStorage.getItem('user_role')

  const fetchGames = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/games?page=${currentPage}`)
      setGames(response.data.games)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error("não achou os jogos:", error)
      alert("não ocnectou no servidor o backend talvez nn esteja ligado")
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchGames()
    }
  }, [currentPage, isAuthenticated])

  return (
    <BrowserRouter>
      {isAuthenticated && <Header />}
      
      <div className={isAuthenticated ? "container" : ""}>
        <Routes>
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/" /> : <Login />} 
          />

          <Route 
            path="/cadastro" 
            element={isAuthenticated ? <Navigate to="/" /> : <RegistroUsuario />} 
          />
          
          <Route 
            path="/" 
            element={isAuthenticated ? <Home games={games} fetchGames={fetchGames} currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} /> : <Navigate to="/login" />} 
          />
          
          <Route 
            path="/noticias" 
            element={isAuthenticated ? <Noticias /> : <Navigate to ="/login" />} 
          />

          <Route 
            path="/cadastrar" 
            element={isAuthenticated && isStaff(userRole) ? <Cadastro fetchGames={fetchGames} /> : <Navigate to="/" />} 
          />
          
          <Route 
            path="/detalhes/:id" 
            element={isAuthenticated ? <Detalhes /> : <Navigate to="/login" />} 
          />

          <Route 
            path="/perfil/:username" 
            element={isAuthenticated ? <Perfil /> : <Navigate to="/login" />} 
          />

          <Route 
            path="*" 
            element={<Navigate to={isAuthenticated ? "/" : "/login"} />} 
          />
        </Routes>
      </div>

      {isAuthenticated && (
        <footer className="footer-aluno">
          <p>Copyright: Lucas Ferraz dos Santos</p>
        </footer>
      )}
    </BrowserRouter>
  )
}

export default App