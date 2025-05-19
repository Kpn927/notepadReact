import { useState } from 'react';
import "../componentescss/navbar.css";

function CustomNavbar({ botones, rutaIcono, titulo }) {
  return (
    <nav className="navbar">
      <a href='/' className='logo'>
        <img src={rutaIcono}></img>
        <p className='logo-title'> {titulo} </p>
      </a>
      <ul className="ul">
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

  const colorTexto = boton.colorTexto || 'black'; // Establece el blanco como valor por defecto

  

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
          style={{ color: colorTexto }} // Aplica el estilo de color desde la variable
        >
          {boton.texto}
          <div className={`hover-box ${isMouseOver ? 'show' : ''}`}></div>
        </button>
      </div>
    </li>
  );
}

export default CustomNavbar;
