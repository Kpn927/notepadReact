import { useState } from 'react';
import "../componentescss/navbar.css";
import { Link } from 'react-router-dom';

function CustomNavbar({ botones, rutaIcono, titulo, userName }) {
  return (
    <nav className="navbar">
      <Link to='/' className='logo'>
        <img src={rutaIcono} alt="App Icon"></img>
        <p className='logo-title'> {titulo} </p>
      </Link>

      <ul className="ul">
        {userName && (
          <li className="li welcome-message-container">
            <span className="welcome-text">¡Hola, {userName}!</span>
          </li>
        )}

        {botones.map((boton, index) => (
          <BotonNavbar key={index} boton={boton} />
        ))}
      </ul>
    </nav>
  );
}

function BotonNavbar({ boton }) {
  const [isMouseOver, setIsMouseOver] = useState(false);

  const handleMouseEnter = () => {
    setIsMouseOver(true);
  };

  const handleMouseLeave = () => {
    setIsMouseOver(false);
  };

  const handleClick = () => {
    if (boton.ruta) {
      window.location.href = boton.ruta;
    }
    if (boton.onClick) {
      boton.onClick();
    }
  };

  const colorTexto = boton.colorTexto || 'black';

  return (
    <li className="li">
      <div
        className={`button-container ${boton.CNBoton || ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button
          onClick={handleClick}
          className="button"
          style={{ color: colorTexto }}
        >
          {boton.texto}
          <div className={`hover-box ${isMouseOver ? 'show' : ''}`}></div>
        </button>
      </div>
    </li>
  );
}

export default CustomNavbar;