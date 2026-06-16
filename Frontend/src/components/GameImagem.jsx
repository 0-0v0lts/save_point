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
