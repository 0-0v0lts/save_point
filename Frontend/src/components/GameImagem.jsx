// Carrega a capa do jogo direto do nosso backend (que serve do banco).
// loading="lazy" -> a imagem só baixa quando aparece na tela.
// O navegador faz cache, então nas próximas vezes carrega instantâneo.
const Gameimagem = ({ id, title }) => {
  const src = `http://localhost:3001/games/${id}/imagem`

  return (
    <div className='image-container'>
      <img
        src={src}
        alt={title}
        loading="lazy"
      />
    </div>
  )
}

export default Gameimagem
